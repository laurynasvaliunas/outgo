import { z } from "zod";

export const messageSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write a message.")
    .max(500, "Messages are limited to 500 characters.")
});

export type MessageInput = z.infer<typeof messageSchema>;
