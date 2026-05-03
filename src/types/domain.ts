export const EVENT_CATEGORIES = [
  "coffee",
  "walk",
  "study",
  "sport",
  "board_games",
  "language_exchange",
  "food",
  "culture",
  "volunteering",
  "no_phone",
  "other"
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const PRICE_TYPES = ["free", "paid", "donation"] as const;
export type PriceType = (typeof PRICE_TYPES)[number];

export const EVENT_STATUSES = [
  "draft",
  "published",
  "cancelled",
  "completed"
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export type ReportTargetType = "event" | "user";

export type EventFilters = {
  category?: EventCategory | "all";
  date?: "today" | "tomorrow" | "week" | "all";
  distanceKm?: number;
  priceType?: PriceType | "all";
  vibe?: string;
  city?: string;
};

export type PublicProfile = {
  id: string;
  full_name: string;
  username: string;
  avatar_url: string | null;
  bio: string | null;
  city: string;
  age_range: string | null;
  interests: string[];
  created_at: string;
  updated_at: string;
};

export type OfflineEvent = {
  id: string;
  title: string;
  description: string;
  category: EventCategory;
  vibe: string;
  location_name: string;
  latitude: number;
  longitude: number;
  city: string;
  start_time: string;
  end_time: string | null;
  max_participants: number;
  price_type: PriceType;
  price_amount: number | null;
  host_id: string;
  status: EventStatus;
  safety_note: string | null;
  moderation_flags: string[];
  created_at: string;
  updated_at: string;
};

export type EventWithMeta = OfflineEvent & {
  host?: Pick<
    PublicProfile,
    "id" | "full_name" | "username" | "avatar_url" | "city"
  > | null;
  participant_count: number;
  is_joined?: boolean;
  is_favorited?: boolean;
};

export type EventMessage = {
  id: string;
  event_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  sender?: Pick<PublicProfile, "id" | "full_name" | "username" | "avatar_url">;
};

export type AppError = {
  message: string;
  code?: string;
};
