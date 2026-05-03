import { supabase } from "./client";
import type { ReportInput } from "@/validation/report";

type CreateReportArgs = ReportInput & {
  reporterId: string;
  reportedEventId?: string;
  reportedUserId?: string;
};

export async function createReport(input: CreateReportArgs) {
  const { error } = await supabase.from("reports").insert({
    reporter_id: input.reporterId,
    reported_event_id: input.reportedEventId ?? null,
    reported_user_id: input.reportedUserId ?? null,
    report_type: input.report_type,
    reason: input.reason.trim(),
    details: input.details?.trim() || null
  });

  if (error) {
    throw error;
  }
}
