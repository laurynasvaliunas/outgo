import { useState } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import { Bug, CreditCard, LogOut, RefreshCw, ShieldAlert } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useRevenueCatCustomerInfo } from "@/hooks/useRevenueCat";
import { signOut } from "@/services/supabase/auth";
import { Sentry } from "@/lib/sentry";
import {
  getActiveRevenueCatEntitlements,
  restoreRevenueCatPurchases
} from "@/lib/revenuecat";
import { colors, spacing, typography } from "@/lib/theme";

export default function SettingsScreen() {
  const { profile } = useAuth();
  const purchases = useRevenueCatCustomerInfo();
  const [safetyReminders, setSafetyReminders] = useState(true);
  const [restoringPurchases, setRestoringPurchases] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Could not sign out", error instanceof Error ? error.message : "Try again.");
    }
  };

  const handleCheckPurchases = async () => {
    const customerInfo = await purchases.refresh();
    if (!customerInfo) {
      Alert.alert(
        "RevenueCat unavailable",
        purchases.available
          ? purchases.error ?? "Could not load customer info."
          : "Add RevenueCat API keys and run an EAS build to test purchases."
      );
      return;
    }

    const activeEntitlements = getActiveRevenueCatEntitlements(customerInfo);
    Alert.alert(
      "RevenueCat connected",
      activeEntitlements.length > 0
        ? `Active entitlements: ${activeEntitlements.join(", ")}`
        : "Customer info loaded. No active entitlements yet."
    );
  };

  const handleRestorePurchases = async () => {
    setRestoringPurchases(true);
    try {
      const customerInfo = await restoreRevenueCatPurchases();
      const activeEntitlements = getActiveRevenueCatEntitlements(customerInfo);
      Alert.alert(
        "Restore complete",
        activeEntitlements.length > 0
          ? `Active entitlements: ${activeEntitlements.join(", ")}`
          : "No active purchases were found for this account."
      );
    } catch (error) {
      Alert.alert(
        "Could not restore purchases",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setRestoringPurchases(false);
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
      <Card style={styles.moderation}>
        <CreditCard size={22} color={colors.primaryDark} />
        <View style={styles.rowCopy}>
          <Text style={styles.rowTitle}>RevenueCat</Text>
          <Text style={styles.rowText}>
            {purchases.available
              ? purchases.entitlementId
                ? `Watching entitlement: ${purchases.entitlementId}`
                : "SDK configured. No entitlement ID set yet."
              : "Add API keys to enable purchase checks."}
          </Text>
        </View>
      </Card>
      <Button
        title="Check RevenueCat"
        variant="secondary"
        loading={purchases.loading}
        icon={<RefreshCw size={18} color={colors.primaryDark} />}
        onPress={handleCheckPurchases}
      />
      <Button
        title="Restore purchases"
        variant="secondary"
        loading={restoringPurchases}
        icon={<CreditCard size={18} color={colors.primaryDark} />}
        onPress={handleRestorePurchases}
      />
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
