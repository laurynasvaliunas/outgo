import { categoryColors, categoryEmojis } from "@/lib/theme";
import type { EventCategory, PriceType } from "@/types/domain";

export const categoryLabels: Record<EventCategory, string> = {
  coffee: "Coffee",
  walk: "Walk",
  study: "Study",
  sport: "Sport",
  board_games: "Board games",
  language_exchange: "Language exchange",
  food: "Food",
  culture: "Culture",
  volunteering: "Volunteering",
  no_phone: "No-phone meetup",
  other: "Other"
};

export const categoryTone: Record<EventCategory, "indigo" | "teal" | "amber" | "rose" | "neutral"> = {
  coffee: "amber",
  walk: "teal",
  study: "indigo",
  sport: "rose",
  board_games: "indigo",
  language_exchange: "teal",
  food: "amber",
  culture: "rose",
  volunteering: "teal",
  no_phone: "neutral",
  other: "indigo"
};

export const categoryMeta: Record<EventCategory, { label: string; emoji: string; color: string }> =
  Object.fromEntries(
    Object.keys(categoryLabels).map((category) => [
      category,
      {
        label: categoryLabels[category as EventCategory],
        emoji: categoryEmojis[category as EventCategory],
        color: categoryColors[category as EventCategory]
      }
    ])
  ) as Record<EventCategory, { label: string; emoji: string; color: string }>;

export const vibeOptions = [
  "Chill",
  "Active",
  "Deep talk",
  "Curious",
  "Playful",
  "Quiet",
  "Beginner-friendly",
  "No pressure",
  "Phone-light",
  "Outdoor"
];

export const priceLabels: Record<PriceType, string> = {
  free: "Free",
  paid: "Paid",
  donation: "Donation"
};
