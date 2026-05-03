import { useCallback, useEffect, useMemo, useState } from "react";
import * as Location from "expo-location";
import {
  getEvent,
  listEvents,
  listHostedEvents,
  listJoinedEvents
} from "@/services/supabase/events";
import type { Coordinates } from "@/lib/distance";
import type { EventFilters, EventWithMeta } from "@/types/domain";
import { useAuth } from "./useAuth";

const EMPTY_EVENT_FILTERS: EventFilters = {};

export function useDeviceOrigin() {
  const [origin, setOrigin] = useState<Coordinates | null>(null);

  useEffect(() => {
    let mounted = true;

    Location.requestForegroundPermissionsAsync()
      .then(async ({ status }) => {
        if (status !== "granted") {
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        if (mounted) {
          setOrigin({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude
          });
        }
      })
      .catch(() => {
        setOrigin(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  return origin;
}

export function useEvents(filters: EventFilters = EMPTY_EVENT_FILTERS) {
  const { user } = useAuth();
  const origin = useDeviceOrigin();
  const [events, setEvents] = useState<EventWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const stableFilters = useMemo(
    () => ({ ...filters }),
    [filters]
  );

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listEvents(stableFilters, user?.id, origin);
      setEvents(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load events.");
    } finally {
      setLoading(false);
    }
  }, [origin, stableFilters, user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { events, loading, error, refresh };
}

export function useEvent(eventId?: string) {
  const { user } = useAuth();
  const [event, setEvent] = useState<EventWithMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!eventId) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getEvent(eventId, user?.id);
      setEvent(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load event.");
    } finally {
      setLoading(false);
    }
  }, [eventId, user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { event, loading, error, refresh };
}

export function useMyEvents() {
  const { user } = useAuth();
  const [joined, setJoined] = useState<EventWithMeta[]>([]);
  const [hosted, setHosted] = useState<EventWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user?.id) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [joinedEvents, hostedEvents] = await Promise.all([
        listJoinedEvents(user.id),
        listHostedEvents(user.id)
      ]);
      setJoined(joinedEvents);
      setHosted(hostedEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load plans.");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { joined, hosted, loading, error, refresh };
}
