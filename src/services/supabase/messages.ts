import { supabase } from "./client";
import { messageSchema } from "@/validation/message";
import type { EventMessage } from "@/types/domain";

async function enrichMessages(messages: EventMessage[]) {
  if (messages.length === 0) {
    return [];
  }

  const senderIds = [...new Set(messages.map((message) => message.sender_id))];
  const { data, error } = await supabase
    .from("profiles")
    .select("id, full_name, username, avatar_url")
    .in("id", senderIds);

  if (error) {
    throw error;
  }

  const profiles = new Map((data ?? []).map((profile) => [profile.id, profile]));
  return messages.map((message) => ({
    ...message,
    sender: profiles.get(message.sender_id)
  }));
}

export async function listEventMessages(eventId: string) {
  const { data, error } = await supabase
    .from("event_messages")
    .select("*")
    .eq("event_id", eventId)
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return enrichMessages((data ?? []) as EventMessage[]);
}

export async function sendEventMessage(
  eventId: string,
  senderId: string,
  body: string
) {
  const parsed = messageSchema.parse({ body });
  const { data, error } = await supabase
    .from("event_messages")
    .insert({
      event_id: eventId,
      sender_id: senderId,
      body: parsed.body
    })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  const [message] = await enrichMessages([data as EventMessage]);
  return message;
}

export function subscribeToEventMessages(
  eventId: string,
  onMessage: (message: EventMessage) => void
) {
  const channel = supabase
    .channel(`event-messages:${eventId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "event_messages",
        filter: `event_id=eq.${eventId}`
      },
      async (payload) => {
        const [message] = await enrichMessages([payload.new as EventMessage]);
        onMessage(message);
      }
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
