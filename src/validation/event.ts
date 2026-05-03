import { z } from "zod";
import { EVENT_CATEGORIES, PRICE_TYPES } from "@/types/domain";

const futureDate = z.string().refine((value) => {
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() > Date.now();
}, "Start time must be in the future.");

export const eventSchema = z
  .object({
    title: z.string().min(3, "Event title is required."),
    description: z.string().min(10, "Event description is required."),
    category: z.enum(EVENT_CATEGORIES),
    vibe: z.string().min(2, "Add a vibe."),
    location_name: z.string().min(2, "Location is required."),
    latitude: z.coerce.number().min(-90).max(90),
    longitude: z.coerce.number().min(-180).max(180),
    city: z.string().min(2, "City is required."),
    start_time: futureDate,
    end_time: z.string().optional(),
    max_participants: z.coerce
      .number()
      .int()
      .min(2, "Use at least 2 participants.")
      .max(20, "OutGo caps MVP events at 20 people."),
    price_type: z.enum(PRICE_TYPES),
    price_amount: z.coerce.number().min(0).optional(),
    safety_note: z.string().max(240).optional()
  })
  .refine(
    (data) => {
      if (!data.end_time) {
        return true;
      }
      return new Date(data.end_time).getTime() > new Date(data.start_time).getTime();
    },
    {
      message: "End time must be after start time.",
      path: ["end_time"]
    }
  )
  .refine(
    (data) => data.price_type !== "paid" || Number(data.price_amount) > 0,
    {
      message: "Add a price amount for paid events.",
      path: ["price_amount"]
    }
  );

export type EventInput = z.infer<typeof eventSchema>;
