import { useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { Bug, LogOut, ShieldAlert } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/supabase/auth";
import { Sentry } from "@/lib/sentry";
import { colors, spacing, typography } from "@/lib/theme";

export default function SettingsScreen() {
  const { profile } = useAuth();
  const [safetyReminders, setSafetyReminders] = useState(true);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Could not sign out", error instanceof Error ? error.message : "Try again.");
    }
  };

  return (
    <Screen>
      <SectionHeader title="Settings" subtitle="Practical controls for a quieter app." />
      <Card style={styles.row}>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>Profile city</Text>
          <Text style={styles.rowText}>{profile?.city || "Not set"}</Text>
        </View>
      </Card>
      <Card style={styles.row}>
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>Safety reminders</Text>
          <Text style={styles.rowText}>Show public-place and host-rule cues.</Text>
        </View>
        <Switch
          value={safetyReminders}
          onValueChange={setSafetyReminders}
          trackColor={{ true: colors.primarySoft, false: colors.border }}
          thumbColor={safetyReminders ? colors.primary : colors.textMuted}
        />
      </Card>
      <Card style={styles.moderation}>
        <ShieldAlert size={22} color={colors.danger} />
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>Moderation</Text>
          <Text style={styles.rowText}>
            Reports are stored in Supabase with open/reviewed/dismissed status
            so an admin workflow can be added cleanly.
          </Text>
        </View>
      </Card>
      <Button
        title="Send Sentry test message"
        variant="secondary"
        icon={<Bug size={18} color={colors.primaryDark} />}
        onPress={() => {
          Sentry.captureMessage("OutGo Sentry test");
          Alert.alert("Sent", "Sentry test message captured if DSN is configured.");
        }}
      />
      <Button
        title="Sign out"
        variant="danger"
        icon={<LogOut size={18} color="#FFFFFF" />}
        onPress={handleSignOut}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  moderation: {
    flexDirection: "row",
    gap: spacing.md
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs
  },
  rowTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  rowText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19
  }
});
