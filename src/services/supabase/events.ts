import { addDays, endOfDay, startOfDay } from "date-fns";
import { supabase } from "./client";
import { eventSchema, type EventInput } from "@/validation/event";
import { distanceKm, type Coordinates } from "@/lib/distance";
import type { Database } from "@/types/database";
import type { EventFilters, EventWithMeta, OfflineEvent } from "@/types/domain";

type EventInsert = Database["public"]["Tables"]["events"]["Insert"];

function cleanEventInput(input: EventInput, hostId: string): EventInsert {
  return {
    title: input.title.trim(),
    description: input.description.trim(),
    category: input.category,
    vibe: input.vibe.trim(),
    location_name: input.location_name.trim(),
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    city: input.city.trim(),
    start_time: new Date(input.start_time).toISOString(),
    end_time: input.end_time ? new Date(input.end_time).toISOString() : null,
    max_participants: Number(input.max_participants),
    price_type: input.price_type,
    price_amount:
      input.price_type === "paid" || input.price_type === "donation"
        ? Number(input.price_amount ?? 0)
        : null,
    safety_note: input.safety_note?.trim() || null,
    host_id: hostId,
    status: "published"
  };
}

function dateRangeForFilter(filter: EventFilters["date"]) {
  const now = new Date();
  if (filter === "today") {
    return [startOfDay(now), endOfDay(now)] as const;
  }
  if (filter === "tomorrow") {
    const tomorrow = addDays(now, 1);
    return [startOfDay(tomorrow), endOfDay(tomorrow)] as const;
  }
  if (filter === "week") {
    return [startOfDay(now), endOfDay(addDays(now, 7))] as const;
  }
  return null;
}

function isActiveOrUpcoming(event: OfflineEvent, now = new Date()) {
  const start = new Date(event.start_time);
  const end = event.end_time ? new Date(event.end_time) : start;
  return end.getTime() >= now.getTime();
}

function eventOverlapsRange(event: OfflineEvent, start: Date, end: Date) {
  const eventStart = new Date(event.start_time);
  const eventEnd = event.end_time ? new Date(event.end_time) : eventStart;
  return eventStart <= end && eventEnd >= start;
}

async function enrichEvents(
  events: OfflineEvent[],
  currentUserId?: string
): Promise<EventWithMeta[]> {
  if (events.length === 0) {
    return [];
  }

  const eventIds = events.map((event) => event.id);
  const hostIds = [...new Set(events.map((event) => event.host_id))];

  const [profilesResult, participantsResult, favoritesResult] = await Promise.all([
    supabase
      .from("profiles")
      .select("id, full_name, username, avatar_url, city")
      .in("id", hostIds),
    supabase
      .from("event_participants")
      .select("event_id, user_id")
      .in("event_id", eventIds),
    currentUserId
      ? supabase
          .from("event_favorites")
          .select("event_id")
          .eq("user_id", currentUserId)
          .in("event_id", eventIds)
      : Promise.resolve({ data: [], error: null })
  ]);

  if (profilesResult.error) {
    throw profilesResult.error;
  }
  if (participantsResult.error) {
    throw participantsResult.error;
  }
  if (favoritesResult.error) {
    throw favoritesResult.error;
  }

  const profiles = new Map(
    (profilesResult.data ?? []).map((profile) => [profile.id, profile])
  );
  const favoriteIds = new Set(
    (favoritesResult.data ?? []).map((favorite) => favorite.event_id)
  );
  const participantRows = participantsResult.data ?? [];

  return events.map((event) => {
    const rows = participantRows.filter((row) => row.event_id === event.id);
    return {
      ...event,
      host: profiles.get(event.host_id) ?? null,
      participant_count: rows.length,
      is_joined: currentUserId
        ? rows.some((row) => row.user_id === currentUserId)
        : false,
      is_favorited: favoriteIds.has(event.id)
    };
  });
}

export async function listEvents(
  filters: EventFilters = {},
  currentUserId?: string,
  origin?: Coordinates | null
) {
  let query = supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("start_time", { ascending: true })
    .limit(250);

  if (filters.city?.trim()) {
    query = query.ilike("city", filters.city.trim());
  }
  if (filters.category && filters.category !== "all") {
    query = query.eq("category", filters.category);
  }
  if (filters.priceType && filters.priceType !== "all") {
    query = query.eq("price_type", filters.priceType);
  }
  if (filters.vibe?.trim()) {
    query = query.ilike("vibe", `%${filters.vibe.trim()}%`);
  }

  const range = dateRangeForFilter(filters.date);
  if (range) {
    query = query.lte("start_time", range[1].toISOString());
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  let events = (data ?? []) as OfflineEvent[];
  const now = new Date();
  events = events.filter((event) => isActiveOrUpcoming(event, now));
  if (range) {
    events = events.filter((event) => eventOverlapsRange(event, range[0], range[1]));
  }

  if (filters.distanceKm && origin) {
    events = events.filter(
      (event) =>
        distanceKm(origin, {
          latitude: event.latitude,
          longitude: event.longitude
        }) <= Number(filters.distanceKm)
    );
  }

  return enrichEvents(events, currentUserId);
}

export async function getEvent(eventId: string, currentUserId?: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .maybeSingle();

  if (error) {
    throw error;
  }
  if (!data) {
    return null;
  }

  const [event] = await enrichEvents([data as OfflineEvent], currentUserId);
  return event;
}

export async function createEvent(input: EventInput, hostId: string) {
  const parsed = eventSchema.parse(input);
  const payload = cleanEventInput(parsed, hostId);
  const { data, error } = await supabase
    .from("events")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as OfflineEvent;
}

export async function joinEvent(eventId: string, userId: string) {
  const { error } = await supabase.from("event_participants").insert({
    event_id: eventId,
    user_id: userId
  });

  if (error) {
    if (error.code === "23505") {
      throw new Error("You already joined this event.");
    }
    throw error;
  }
}

export async function leaveEvent(eventId: string, userId: string) {
  const { error } = await supabase
    .from("event_participants")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function favoriteEvent(eventId: string, userId: string) {
  const { error } = await supabase.from("event_favorites").insert({
    event_id: eventId,
    user_id: userId
  });

  if (error && error.code !== "23505") {
    throw error;
  }
}

export async function unfavoriteEvent(eventId: string, userId: string) {
  const { error } = await supabase
    .from("event_favorites")
    .delete()
    .eq("event_id", eventId)
    .eq("user_id", userId);

  if (error) {
    throw error;
  }
}

export async function listJoinedEvents(userId: string) {
  const { data, error } = await supabase
    .from("event_participants")
    .select("event_id")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  if (error) {
    throw error;
  }

  const eventIds = (data ?? []).map((row) => row.event_id);
  if (eventIds.length === 0) {
    return [];
  }

  const { data: events, error: eventsError } = await supabase
    .from("events")
    .select("*")
    .in("id", eventIds)
    .order("start_time", { ascending: true });

  if (eventsError) {
    throw eventsError;
  }

  return enrichEvents((events ?? []) as OfflineEvent[], userId);
}

export async function listHostedEvents(userId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("host_id", userId)
    .order("start_time", { ascending: true });

  if (error) {
    throw error;
  }

  return enrichEvents((data ?? []) as OfflineEvent[], userId);
}
