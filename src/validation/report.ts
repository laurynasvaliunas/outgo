import { z } from "zod";

export const reportSchema = z.object({
  report_type: z.enum(["safety", "spam", "harassment", "misleading", "other"]),
  reason: z.string().min(4, "Tell us what happened."),
  details: z.string().max(600, "Keep details under 600 characters.").optional()
});

export type ReportInput = z.infer<typeof reportSchema>;
