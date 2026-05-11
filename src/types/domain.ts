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
  date?: "today" | "tomorrow" | "weekend" | "week" | "all";
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
  hobbies: string[];
  life_context: string[];
  social_goals: string[];
  created_at: string;
  updated_at: string;
};

export type ProfileStats = {
  plansJoined: number;
  plansHosted: number;
  memberSince: string;
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
  participants?: Pick<
    PublicProfile,
    "id" | "full_name" | "username" | "avatar_url"
  >[];
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

export const NOTIFICATION_TYPES = [
  "event_chat",
  "event_joined",
  "event_update",
  "event_cancelled",
  "event_reminder",
  "report_update"
] as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export type NotificationPreferences = {
  user_id: string;
  master_enabled: boolean;
  chat_messages: boolean;
  event_reminders: boolean;
  host_updates: boolean;
  joins: boolean;
  safety_updates: boolean;
  created_at?: string;
  updated_at?: string;
};

export type PushNotificationData = {
  type?: NotificationType;
  eventId?: string;
  messageId?: string;
  reportId?: string;
  reminderOffsetMinutes?: number;
};

export type SubscriptionStatus = {
  user_id: string;
  revenuecat_app_user_id: string;
  entitlement_id: string;
  is_active: boolean;
  product_id: string | null;
  store: string | null;
  environment: string | null;
  expiration_at: string | null;
  latest_event_type: string | null;
  created_at: string;
  updated_at: string;
};

export type AppError = {
  message: string;
  code?: string;
};
