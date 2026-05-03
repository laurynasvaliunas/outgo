import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { router } from "expo-router";
import type { PurchasesOffering, PurchasesPackage } from "react-native-purchases";
import {
  ArrowLeft,
  Check,
  CreditCard,
  RefreshCw,
  Sparkles
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useRevenueCatCustomerInfo } from "@/hooks/useRevenueCat";
import { track } from "@/lib/analytics";
import {
  getRevenueCatPaywallOffering,
  getRevenueCatPaywallPackages,
  hasActiveRevenueCatEntitlement,
  isRevenueCatAvailable,
  isRevenueCatPurchaseCancelled,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases
} from "@/lib/revenuecat";
import { colors, radii, spacing, typography } from "@/lib/theme";

type PlanKey = "monthly" | "yearly";

export default function PaywallScreen() {
  const purchases = useRevenueCatCustomerInfo();
  const [offering, setOffering] = useState<PurchasesOffering | null>(null);
  const [loadingOffering, setLoadingOffering] = useState(true);
  const [offeringError, setOfferingError] = useState<string | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>("yearly");
  const [purchasingPlan, setPurchasingPlan] = useState<PlanKey | null>(null);
  const [restoring, setRestoring] = useState(false);

  const loadOffering = useCallback(async () => {
    setLoadingOffering(true);
    setOfferingError(null);
    try {
      const nextOffering = await getRevenueCatPaywallOffering();
      setOffering(nextOffering);
    } catch (error) {
      setOfferingError(
        error instanceof Error ? error.message : "Could not load subscription plans."
      );
    } finally {
      setLoadingOffering(false);
    }
  }, []);

  useEffect(() => {
    void loadOffering();
  }, [loadOffering]);

  const packages = useMemo(
    () => getRevenueCatPaywallPackages(offering),
    [offering]
  );
  const active = purchases.hasConfiguredEntitlement;

  const plans = useMemo(
    () => [
      {
        key: "monthly" as const,
        title: "Monthly",
        price: packages.monthly?.product.priceString ?? "€3",
        cadence: "per month",
        note: "Flexible monthly support.",
        revenueCatPackage: packages.monthly
      },
      {
        key: "yearly" as const,
        title: "Yearly",
        price: packages.yearly?.product.priceString ?? "€24",
        cadence: "per year",
        note: "Best value. Save €12 compared with monthly.",
        badge: "Best value",
        revenueCatPackage: packages.yearly
      }
    ],
    [packages.monthly, packages.yearly]
  );

  const selectedRevenueCatPackage = plans.find(
    (plan) => plan.key === selectedPlan
  )?.revenueCatPackage;

  const handlePurchase = async (plan: PlanKey, aPackage: PurchasesPackage | null) => {
    if (!aPackage) {
      Alert.alert(
        "Plan not ready",
        "Create this product in App Store Connect, attach it to the RevenueCat default offering, then rebuild."
      );
      return;
    }

    setSelectedPlan(plan);
    setPurchasingPlan(plan);
    try {
      const customerInfo = await purchaseRevenueCatPackage(aPackage);
      track("paywall_purchase_complete", {
        plan,
        product_id: aPackage.product.identifier
      });

      if (hasActiveRevenueCatEntitlement(customerInfo)) {
        Alert.alert("OutGo Plus is active", "Thanks for supporting more real-life plans.");
        router.back();
        return;
      }

      Alert.alert(
        "Purchase complete",
        "The purchase finished, but the OutGo Plus entitlement is not active yet. Check the RevenueCat entitlement setup."
      );
    } catch (error) {
      if (!isRevenueCatPurchaseCancelled(error)) {
        Alert.alert(
          "Purchase failed",
          error instanceof Error ? error.message : "Please try again."
        );
      }
    } finally {
      setPurchasingPlan(null);
      await purchases.refresh();
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const customerInfo = await restoreRevenueCatPurchases();
      await purchases.refresh();

      if (hasActiveRevenueCatEntitlement(customerInfo)) {
        Alert.alert("Restored", "OutGo Plus is active on this account.");
        router.back();
        return;
      }

      Alert.alert("No active subscription", "No active OutGo Plus purchase was found.");
    } catch (error) {
      Alert.alert(
        "Could not restore",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setRestoring(false);
    }
  };

  if (!isRevenueCatAvailable()) {
    return (
      <Screen>
        <TopBar />
        <EmptyState
          title="RevenueCat is not configured"
          message="Add the RevenueCat public SDK key and run an EAS development or TestFlight build to test subscriptions."
          actionTitle="Try again"
          onAction={loadOffering}
        />
      </Screen>
    );
  }

  return (
    <Screen contentStyle={styles.screen}>
      <TopBar />
      <View style={styles.header}>
        <View style={styles.iconCircle}>
          <Sparkles size={28} color={colors.primaryDark} />
        </View>
        <SectionHeader
          title={active ? "OutGo Plus is active" : "OutGo Plus"}
          subtitle="Support an offline-first community and unlock the Plus plan as new member features roll out."
        />
      </View>

      <Card style={styles.benefitsCard}>
        {[
          "Unlimited access to Plus as premium features are released.",
          "Priority access to upcoming discovery and hosting tools.",
          "Support a calmer app that helps people meet offline."
        ].map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Check size={18} color={colors.success} />
            <Text style={styles.benefitText}>{benefit}</Text>
          </View>
        ))}
      </Card>

      {loadingOffering ? <LoadingState message="Loading plans..." /> : null}
      {offeringError ? (
        <EmptyState
          title="Could not load plans"
          message={offeringError}
          actionTitle="Try again"
          onAction={loadOffering}
        />
      ) : null}

      {!loadingOffering && !offeringError ? (
        <View style={styles.planList}>
          {plans.map((plan) => (
            <PlanCard
              key={plan.key}
              title={plan.title}
              price={plan.price}
              cadence={plan.cadence}
              note={plan.note}
              badge={plan.badge}
              selected={selectedPlan === plan.key}
              disabled={!plan.revenueCatPackage}
              onPress={() => setSelectedPlan(plan.key)}
            />
          ))}
        </View>
      ) : null}

      {!loadingOffering && !offeringError ? (
        <View style={styles.actions}>
          <Button
            title={active ? "OutGo Plus active" : "Continue"}
            loading={purchasingPlan === selectedPlan}
            disabled={active || !selectedRevenueCatPackage}
            icon={<CreditCard size={18} color="#FFFFFF" />}
            onPress={() => handlePurchase(selectedPlan, selectedRevenueCatPackage ?? null)}
          />
          <Button
            title="Restore purchases"
            variant="secondary"
            loading={restoring}
            icon={<RefreshCw size={18} color={colors.primaryDark} />}
            onPress={handleRestore}
          />
        </View>
      ) : null}

      <Text style={styles.storeNote}>
        Your final subscription price is confirmed by the App Store or Google Play
        before checkout. Subscriptions renew automatically until cancelled.
      </Text>

      <View style={styles.legalLinks}>
        <LegalLink title="Terms" route="/legal/terms" />
        <Text style={styles.legalDivider}>·</Text>
        <LegalLink title="Subscription Terms" route="/legal/subscriptions" />
        <Text style={styles.legalDivider}>·</Text>
        <LegalLink title="Privacy" route="/legal/privacy" />
      </View>
    </Screen>
  );
}

function TopBar() {
  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ArrowLeft size={22} color={colors.primaryDark} />
      </Pressable>
    </View>
  );
}

type PlanCardProps = {
  title: string;
  price: string;
  cadence: string;
  note: string;
  badge?: string;
  selected: boolean;
  disabled: boolean;
  onPress: () => void;
};

function PlanCard({
  title,
  price,
  cadence,
  note,
  badge,
  selected,
  disabled,
  onPress
}: PlanCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.planCard,
        selected && styles.planCardSelected,
        disabled && styles.planCardDisabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <View style={styles.planTop}>
        <Text style={styles.planTitle}>{title}</Text>
        {badge ? <Text style={styles.badge}>{badge}</Text> : null}
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.price}>{price}</Text>
        <Text style={styles.cadence}>{cadence}</Text>
      </View>
      <Text style={styles.note}>
        {disabled ? "Waiting for RevenueCat product setup." : note}
      </Text>
    </Pressable>
  );
}

function LegalLink({ title, route }: { title: string; route: "/legal/terms" | "/legal/privacy" | "/legal/subscriptions" }) {
  return (
    <Pressable accessibilityRole="link" onPress={() => router.push(route)}>
      <Text style={styles.legalLink}>{title}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center"
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.82
  },
  header: {
    gap: spacing.md
  },
  iconCircle: {
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center"
  },
  benefitsCard: {
    gap: spacing.md,
    backgroundColor: colors.surface
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  benefitText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 22,
    fontWeight: "700"
  },
  planList: {
    gap: spacing.md
  },
  planCard: {
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm
  },
  planCardSelected: {
    borderColor: colors.primaryDark,
    backgroundColor: colors.primarySoft
  },
  planCardDisabled: {
    opacity: 0.64
  },
  planTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  planTitle: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: "900"
  },
  badge: {
    color: colors.surface,
    backgroundColor: colors.primaryDark,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.tiny,
    fontWeight: "900",
    overflow: "hidden"
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm
  },
  price: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    letterSpacing: 0
  },
  cadence: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "800",
    paddingBottom: spacing.xs
  },
  note: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19,
    fontWeight: "700"
  },
  actions: {
    gap: spacing.md
  },
  storeNote: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19,
    textAlign: "center"
  },
  legalLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm
  },
  legalLink: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: "900"
  },
  legalDivider: {
    color: colors.textMuted,
    fontSize: typography.small
  }
});
