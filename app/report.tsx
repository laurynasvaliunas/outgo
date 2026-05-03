import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Flag } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth } from "@/hooks/useAuth";
import { createReport } from "@/services/supabase/reports";
import { reportSchema, type ReportInput } from "@/validation/report";
import { colors, spacing, typography } from "@/lib/theme";
import { track } from "@/lib/analytics";

const reasons: { label: string; value: ReportInput["report_type"] }[] = [
  { label: "Safety", value: "safety" },
  { label: "Spam", value: "spam" },
  { label: "Harassment", value: "harassment" },
  { label: "Misleading", value: "misleading" },
  { label: "Other", value: "other" }
];

export default function ReportScreen() {
  const { targetType, eventId, userId } = useLocalSearchParams<{
    targetType?: "event" | "user";
    eventId?: string;
    userId?: string;
  }>();
  const { user } = useAuth();
  const [reportType, setReportType] = useState<ReportInput["report_type"]>("safety");
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const submit = async () => {
    if (!user?.id) {
      Alert.alert("Sign in needed", "Please log in before sending a report.");
      return;
    }

    const parsed = reportSchema.safeParse({
      report_type: reportType,
      reason,
      details
    });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({
        report_type: fields.report_type?.[0],
        reason: fields.reason?.[0],
        details: fields.details?.[0]
      });
      return;
    }

    setLoading(true);
    try {
      await createReport({
        ...parsed.data,
        reporterId: user.id,
        reportedEventId: targetType === "event" ? eventId : undefined,
        reportedUserId: targetType === "user" ? userId : undefined
      });
      track("report_create", { target_type: targetType ?? "unknown" });
      Alert.alert("Report sent", "Thanks. We will review this before taking action.");
      router.back();
    } catch (error) {
      Alert.alert(
        "Could not send report",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="Report"
        subtitle="Reports help keep the app safe without turning it into public drama."
      />
      <Card style={styles.card}>
        <Flag size={24} color={colors.danger} />
        <View style={styles.cardCopy}>
          <Text style={styles.cardTitle}>
            Reporting {targetType === "user" ? "a user" : "an event"}
          </Text>
          <Text style={styles.cardText}>
            Include enough context for a moderator to understand the issue.
          </Text>
        </View>
      </Card>
      <SegmentedControl
        value={reportType}
        onChange={setReportType}
        options={reasons}
      />
      <Input
        label="Reason"
        value={reason}
        onChangeText={setReason}
        error={errors.reason}
        placeholder="Short summary"
      />
      <Input
        label="Details"
        value={details}
        onChangeText={setDetails}
        error={errors.details}
        multiline
        placeholder="What happened? Do not include sensitive information unless necessary."
      />
      <Button
        title="Send report"
        variant="danger"
        loading={loading}
        icon={<Flag size={18} color="#FFFFFF" />}
        onPress={submit}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    gap: spacing.md
  },
  cardCopy: {
    flex: 1,
    gap: spacing.xs
  },
  cardTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  cardText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19
  }
});
