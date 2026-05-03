import { z } from "zod";

export const profileSchema = z.object({
  full_name: z.string().min(2, "Add your name."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(24, "Username must be 24 characters or fewer.")
    .regex(/^[a-zA-Z0-9_]+$/, "Use only letters, numbers and underscores."),
  avatar_url: z.string().url("Use a valid image URL.").or(z.literal("")).optional(),
  bio: z.string().max(220, "Keep your bio under 220 characters.").optional(),
  city: z.string().min(2, "Add your city."),
  age_range: z.string().optional(),
  interests: z.array(z.string()).max(12, "Pick up to 12 interests.")
});

export type ProfileInput = z.infer<typeof profileSchema>;
