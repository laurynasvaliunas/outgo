import { useCallback, useEffect, useState } from "react";
import {
  listEventMessages,
  sendEventMessage,
  subscribeToEventMessages
} from "@/services/supabase/messages";
import type { EventMessage } from "@/types/domain";
import { useAuth } from "./useAuth";

export function useEventMessages(eventId?: string) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<EventMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!eventId) {
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await listEventMessages(eventId);
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load chat.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!eventId) {
      return undefined;
    }

    return subscribeToEventMessages(eventId, (message) => {
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    });
  }, [eventId]);

  const send = useCallback(
    async (body: string) => {
      if (!eventId || !user?.id) {
        throw new Error("You need to join this event before chatting.");
      }

      const message = await sendEventMessage(eventId, user.id, body);
      setMessages((current) => {
        if (current.some((item) => item.id === message.id)) {
          return current;
        }
        return [...current, message];
      });
    },
    [eventId, user?.id]
  );

  return { messages, loading, error, refresh, send };
}
