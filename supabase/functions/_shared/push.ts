import { createClient, type SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2.104.1";

export type NotificationType =
  | "event_chat"
  | "event_joined"
  | "event_update"
  | "event_cancelled"
  | "event_reminder"
  | "report_update";

type PreferenceKey =
  | "chat_messages"
  | "event_reminders"
  | "host_updates"
  | "joins"
  | "safety_updates";

type PushTokenRow = {
  id: string;
  user_id: string;
  expo_push_token: string;
};

type NotificationPreferenceRow = {
  user_id: string;
  master_enabled: boolean;
  chat_messages: boolean;
  event_reminders: boolean;
  host_updates: boolean;
  joins: boolean;
  safety_updates: boolean;
};

type PushRecipient = PushTokenRow & {
  preference?: NotificationPreferenceRow;
};

export type PushPayload = {
  type: NotificationType;
  title: string;
  body: string;
  recipientIds: string[];
  preferenceKey: PreferenceKey;
  eventId?: string | null;
  messageId?: string | null;
  reportId?: string | null;
  reminderOffsetMinutes?: number | null;
  sourceId: string;
  data: Record<string, unknown>;
};

type ExpoTicket =
  | {
      status: "ok";
      id: string;
    }
  | {
      status: "error";
      message?: string;
      details?: {
        error?: string;
      };
    };

export function createServiceClient() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export function verifyWebhookSecret(request: Request) {
  const expectedSecret = Deno.env.get("OUTGO_PUSH_WEBHOOK_SECRET");
  if (!expectedSecret) {
    throw new Error("Missing OUTGO_PUSH_WEBHOOK_SECRET.");
  }

  const receivedSecret = request.headers.get("x-outgo-webhook-secret");
  if (receivedSecret !== expectedSecret) {
    return false;
  }

  return true;
}

export function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function uniqueIds(ids: Array<string | null | undefined>) {
  return [...new Set(ids.filter(Boolean) as string[])];
}

export function displayName(profile?: { full_name?: string | null; username?: string | null }) {
  return profile?.full_name?.trim() || profile?.username?.trim() || "Someone";
}

export function truncate(text: string, maxLength = 120) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }
  return `${normalized.slice(0, maxLength - 1).trim()}…`;
}

function chunk<T>(items: T[], size: number) {
  const chunks: T[][] = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

function shouldSend(preference: NotificationPreferenceRow | undefined, key: PreferenceKey) {
  if (!preference) {
    return true;
  }
  return preference.master_enabled && preference[key];
}

async function getRecipients(
  supabase: SupabaseClient,
  recipientIds: string[],
  preferenceKey: PreferenceKey
): Promise<PushRecipient[]> {
  const ids = uniqueIds(recipientIds);
  if (ids.length === 0) {
    return [];
  }

  const [{ data: tokens, error: tokensError }, { data: preferences, error: preferencesError }] =
    await Promise.all([
      supabase
        .from("push_tokens")
        .select("id, user_id, expo_push_token")
        .in("user_id", ids)
        .eq("active", true),
      supabase
        .from("notification_preferences")
        .select(
          "user_id, master_enabled, chat_messages, event_reminders, host_updates, joins, safety_updates"
        )
        .in("user_id", ids)
    ]);

  if (tokensError) {
    throw tokensError;
  }
  if (preferencesError) {
    throw preferencesError;
  }

  const preferenceByUserId = new Map(
    (preferences ?? []).map((preference) => [
      preference.user_id,
      preference as NotificationPreferenceRow
    ])
  );

  return ((tokens ?? []) as PushTokenRow[])
    .map((token) => ({
      ...token,
      preference: preferenceByUserId.get(token.user_id)
    }))
    .filter((recipient) => shouldSend(recipient.preference, preferenceKey));
}

function deliveryKey(payload: PushPayload, recipient: PushRecipient) {
  return [
    payload.type,
    payload.sourceId,
    payload.reminderOffsetMinutes ?? "none",
    recipient.user_id,
    recipient.id
  ].join(":");
}

async function disableToken(
  supabase: SupabaseClient,
  tokenId: string,
  reason: string
) {
  await supabase
    .from("push_tokens")
    .update({
      active: false,
      disabled_at: new Date().toISOString(),
      disabled_reason: reason
    })
    .eq("id", tokenId);
}

async function sendExpoBatch(messages: Record<string, unknown>[]) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Accept-Encoding": "gzip, deflate",
    "Content-Type": "application/json"
  };

  const accessToken = Deno.env.get("EXPO_PUSH_ACCESS_TOKEN");
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  const response = await fetch("https://exp.host/--/api/v2/push/send", {
    method: "POST",
    headers,
    body: JSON.stringify(messages)
  });

  const json = await response.json();
  if (!response.ok) {
    throw new Error(JSON.stringify(json));
  }

  return (Array.isArray(json.data) ? json.data : [json.data]) as ExpoTicket[];
}

export async function sendPushPayload(
  supabase: SupabaseClient,
  payload: PushPayload
) {
  const recipients = await getRecipients(
    supabase,
    payload.recipientIds,
    payload.preferenceKey
  );

  if (recipients.length === 0) {
    return { queued: 0, sent: 0 };
  }

  const deliveryRows = recipients.map((recipient) => ({
    delivery_key: deliveryKey(payload, recipient),
    notification_type: payload.type,
    recipient_id: recipient.user_id,
    push_token_id: recipient.id,
    expo_push_token: recipient.expo_push_token,
    event_id: payload.eventId ?? null,
    message_id: payload.messageId ?? null,
    report_id: payload.reportId ?? null,
    reminder_offset_minutes: payload.reminderOffsetMinutes ?? null,
    title: payload.title,
    body: payload.body,
    data: payload.data,
    status: "queued"
  }));

  const { data: insertedDeliveries, error: insertError } = await supabase
    .from("notification_deliveries")
    .upsert(deliveryRows, {
      onConflict: "delivery_key",
      ignoreDuplicates: true
    })
    .select("id, delivery_key, push_token_id, expo_push_token");

  if (insertError) {
    throw insertError;
  }

  const deliveries = insertedDeliveries ?? [];
  if (deliveries.length === 0) {
    return { queued: 0, sent: 0 };
  }

  const deliveryByToken = new Map(
    deliveries.map((delivery) => [delivery.expo_push_token, delivery])
  );
  const messages = deliveries.map((delivery) => ({
    to: delivery.expo_push_token,
    sound: "default",
    channelId: "outgo-default",
    title: payload.title,
    body: payload.body,
    data: payload.data,
    priority: "default"
  }));

  let sent = 0;

  for (const messageBatch of chunk(messages, 100)) {
    const tickets = await sendExpoBatch(messageBatch);

    await Promise.all(
      tickets.map(async (ticket, index) => {
        const message = messageBatch[index];
        const delivery = deliveryByToken.get(message.to as string);
        if (!delivery) {
          return;
        }

        if (ticket.status === "ok") {
          sent += 1;
          await supabase
            .from("notification_deliveries")
            .update({
              status: "sent",
              expo_ticket_id: ticket.id,
              sent_at: new Date().toISOString()
            })
            .eq("id", delivery.id);
          return;
        }

        const errorCode = ticket.details?.error ?? ticket.message ?? "Expo push error";
        await supabase
          .from("notification_deliveries")
          .update({
            status: "error",
            expo_error: errorCode
          })
          .eq("id", delivery.id);

        if (ticket.details?.error === "DeviceNotRegistered" && delivery.push_token_id) {
          await disableToken(supabase, delivery.push_token_id, "DeviceNotRegistered");
        }
      })
    );
  }

  return { queued: deliveries.length, sent };
}
