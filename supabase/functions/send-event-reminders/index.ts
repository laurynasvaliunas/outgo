import {
  createServiceClient,
  jsonResponse,
  sendPushPayload,
  uniqueIds,
  verifyWebhookSecret
} from "../_shared/push.ts";

const REMINDER_OFFSETS_MINUTES = [1440, 60] as const;
const WINDOW_MINUTES = 5;

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    if (!verifyWebhookSecret(request)) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const supabase = createServiceClient();
    const results = [];

    for (const offsetMinutes of REMINDER_OFFSETS_MINUTES) {
      results.push(
        ...(await sendReminderWindow(supabase, offsetMinutes))
      );
    }

    return jsonResponse({ processed: results.length, results });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

async function sendReminderWindow(
  supabase: ReturnType<typeof createServiceClient>,
  offsetMinutes: number
) {
  const now = Date.now();
  const lowerBound = new Date(
    now + (offsetMinutes - WINDOW_MINUTES) * 60_000
  ).toISOString();
  const upperBound = new Date(
    now + (offsetMinutes + WINDOW_MINUTES) * 60_000
  ).toISOString();

  const { data: events, error } = await supabase
    .from("events")
    .select("id, title, start_time, host_id, status")
    .eq("status", "published")
    .gte("start_time", lowerBound)
    .lte("start_time", upperBound);

  if (error) {
    throw error;
  }

  const results = [];

  for (const event of events ?? []) {
    const { data: participants, error: participantsError } = await supabase
      .from("event_participants")
      .select("user_id")
      .eq("event_id", event.id);

    if (participantsError) {
      throw participantsError;
    }

    const recipientIds = uniqueIds([
      event.host_id,
      ...(participants ?? []).map((participant) => participant.user_id)
    ]);

    const when =
      offsetMinutes === 1440 ? "tomorrow" : "in about an hour";

    const delivery = await sendPushPayload(supabase, {
      type: "event_reminder",
      title: "Plan reminder",
      body: `${event.title} starts ${when}.`,
      recipientIds,
      preferenceKey: "event_reminders",
      eventId: event.id,
      reminderOffsetMinutes: offsetMinutes,
      sourceId: `${event.id}:reminder`,
      data: {
        type: "event_reminder",
        eventId: event.id,
        reminderOffsetMinutes: offsetMinutes
      }
    });

    results.push({
      eventId: event.id,
      offsetMinutes,
      ...delivery
    });
  }

  return results;
}
