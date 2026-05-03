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

export const categoryTone: Record<EventCategory, "green" | "blue" | "clay"> = {
  coffee: "clay",
  walk: "green",
  study: "blue",
  sport: "green",
  board_games: "clay",
  language_exchange: "blue",
  food: "clay",
  culture: "blue",
  volunteering: "green",
  no_phone: "green",
  other: "blue"
};

export const vibeOptions = [
  "Quiet",
  "Beginner-friendly",
  "Talkative",
  "No pressure",
  "Focused",
  "Phone-light",
  "Outdoor",
  "Creative"
];

export const priceLabels: Record<PriceType, string> = {
  free: "Free",
  paid: "Paid",
  donation: "Donation"
};
