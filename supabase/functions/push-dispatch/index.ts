import {
  createServiceClient,
  displayName,
  jsonResponse,
  sendPushPayload,
  truncate,
  uniqueIds,
  verifyWebhookSecret,
  type NotificationType
} from "../_shared/push.ts";

type WebhookPayload = {
  type: NotificationType;
  record: Record<string, unknown>;
  old_record?: Record<string, unknown> | null;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    if (!verifyWebhookSecret(request)) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const payload = (await request.json()) as WebhookPayload;
    const supabase = createServiceClient();

    switch (payload.type) {
      case "event_chat":
        return jsonResponse(await dispatchEventChat(supabase, payload.record));
      case "event_joined":
        return jsonResponse(await dispatchEventJoined(supabase, payload.record));
      case "event_update":
        return jsonResponse(await dispatchEventUpdate(supabase, payload.record));
      case "event_cancelled":
        return jsonResponse(await dispatchEventCancelled(supabase, payload.record));
      case "report_update":
        return jsonResponse(await dispatchReportUpdate(supabase, payload.record));
      default:
        return jsonResponse({ error: "Unsupported notification type" }, 400);
    }
  } catch (error) {
    console.error(error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

async function dispatchEventChat(
  supabase: ReturnType<typeof createServiceClient>,
  record: Record<string, unknown>
) {
  const eventId = String(record.event_id);
  const messageId = String(record.id);
  const senderId = String(record.sender_id);
  const body = String(record.body ?? "");

  const [{ data: event, error: eventError }, { data: participants, error: participantsError }, { data: sender, error: senderError }] =
    await Promise.all([
      supabase.from("events").select("id, title, host_id").eq("id", eventId).single(),
      supabase.from("event_participants").select("user_id").eq("event_id", eventId),
      supabase.from("profiles").select("full_name, username").eq("id", senderId).maybeSingle()
    ]);

  if (eventError) throw eventError;
  if (participantsError) throw participantsError;
  if (senderError) throw senderError;
  if (!event) throw new Error("Event not found for chat notification.");

  const recipientIds = uniqueIds([
    event.host_id,
    ...(participants ?? []).map((participant) => participant.user_id)
  ]).filter((userId) => userId !== senderId);

  return sendPushPayload(supabase, {
    type: "event_chat",
    title: event.title,
    body: `${displayName(sender ?? undefined)}: ${truncate(body, 96)}`,
    recipientIds,
    preferenceKey: "chat_messages",
    eventId,
    messageId,
    sourceId: messageId,
    data: {
      type: "event_chat",
      eventId,
      messageId
    }
  });
}

async function dispatchEventJoined(
  supabase: ReturnType<typeof createServiceClient>,
  record: Record<string, unknown>
) {
  const eventId = String(record.event_id);
  const joinedUserId = String(record.user_id);

  const [{ data: event, error: eventError }, { data: profile, error: profileError }] =
    await Promise.all([
      supabase.from("events").select("id, title, host_id").eq("id", eventId).single(),
      supabase.from("profiles").select("full_name, username").eq("id", joinedUserId).maybeSingle()
    ]);

  if (eventError) throw eventError;
  if (profileError) throw profileError;
  if (!event) throw new Error("Event not found for join notification.");

  const recipientIds = event.host_id === joinedUserId ? [] : [event.host_id];

  return sendPushPayload(supabase, {
    type: "event_joined",
    title: "Someone joined your plan",
    body: `${displayName(profile ?? undefined)} joined ${event.title}.`,
    recipientIds,
    preferenceKey: "joins",
    eventId,
    sourceId: `${eventId}:${joinedUserId}`,
    data: {
      type: "event_joined",
      eventId,
      userId: joinedUserId
    }
  });
}

async function dispatchEventUpdate(
  supabase: ReturnType<typeof createServiceClient>,
  record: Record<string, unknown>
) {
  const eventId = String(record.id);
  const hostId = String(record.host_id);
  const title = String(record.title ?? "Your plan");

  const { data: participants, error } = await supabase
    .from("event_participants")
    .select("user_id")
    .eq("event_id", eventId);

  if (error) throw error;

  const recipientIds = uniqueIds((participants ?? []).map((row) => row.user_id))
    .filter((userId) => userId !== hostId);

  return sendPushPayload(supabase, {
    type: "event_update",
    title: "Plan updated",
    body: `${title} has updated details. Check before you go.`,
    recipientIds,
    preferenceKey: "host_updates",
    eventId,
    sourceId: `${eventId}:${String(record.updated_at ?? new Date().toISOString())}`,
    data: {
      type: "event_update",
      eventId
    }
  });
}

async function dispatchEventCancelled(
  supabase: ReturnType<typeof createServiceClient>,
  record: Record<string, unknown>
) {
  const eventId = String(record.id);
  const hostId = String(record.host_id);
  const title = String(record.title ?? "Your plan");

  const { data: participants, error } = await supabase
    .from("event_participants")
    .select("user_id")
    .eq("event_id", eventId);

  if (error) throw error;

  const recipientIds = uniqueIds((participants ?? []).map((row) => row.user_id))
    .filter((userId) => userId !== hostId);

  return sendPushPayload(supabase, {
    type: "event_cancelled",
    title: "Plan cancelled",
    body: `${title} was cancelled by the host.`,
    recipientIds,
    preferenceKey: "host_updates",
    eventId,
    sourceId: `${eventId}:cancelled`,
    data: {
      type: "event_cancelled",
      eventId
    }
  });
}

async function dispatchReportUpdate(
  supabase: ReturnType<typeof createServiceClient>,
  record: Record<string, unknown>
) {
  const reportId = String(record.id);
  const reporterId = String(record.reporter_id);
  const status = String(record.status ?? "updated");

  return sendPushPayload(supabase, {
    type: "report_update",
    title: "Report update",
    body: `Your report was marked ${status}.`,
    recipientIds: [reporterId],
    preferenceKey: "safety_updates",
    reportId,
    sourceId: `${reportId}:${status}`,
    data: {
      type: "report_update",
      reportId
    }
  });
}
