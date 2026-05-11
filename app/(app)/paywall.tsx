import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
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
  RefreshCw
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { useAppTheme } from "@/hooks/useAppTheme";
import { usePlusStatus } from "@/hooks/usePlusStatus";
import { track } from "@/lib/analytics";
import {
  getRevenueCatPaywallOffering,
  getRevenueCatPaywallPackages,
  getRevenueCatUnavailableMessage,
  hasActiveRevenueCatEntitlement,
  isRevenueCatAvailable,
  isRevenueCatPurchaseCancelled,
  purchaseRevenueCatPackage,
  restoreRevenueCatPurchases
} from "@/lib/revenuecat";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { haptic } from "@/lib/haptics";

type PlanKey = "monthly" | "yearly";

const APPLE_STANDARD_EULA_URL = "https://www.apple.com/legal/macapps/stdeula/";
const logoSource = require("../../assets/images/icon.png");

export default function PaywallScreen() {
  const { colors, shadows } = useAppTheme();
  const plus = usePlusStatus();
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
  const active = plus.active;

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
      haptic("light");
      const customerInfo = await purchaseRevenueCatPackage(aPackage);
      track("paywall_purchase_complete", {
        plan,
        product_id: aPackage.product.identifier
      });

      if (hasActiveRevenueCatEntitlement(customerInfo)) {
        haptic("success");
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
      await plus.refresh();
    }
  };

  const handleRestore = async () => {
    setRestoring(true);
    try {
      const customerInfo = await restoreRevenueCatPurchases();
      await plus.refresh();

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
          message={
            getRevenueCatUnavailableMessage() ??
            "Add the RevenueCat public SDK key and run an EAS development or TestFlight build to test subscriptions."
          }
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
        <View
          style={[
            styles.iconCircle,
            {
              backgroundColor: colors.backgroundElevated,
              borderColor: colors.border,
              ...shadows.medium
            }
          ]}
        >
          <Image source={logoSource} style={styles.logo} resizeMode="cover" />
        </View>
        <Text style={[styles.heroTitle, { color: colors.text }]}>
          {active ? "OutGo Plus is active" : "OutGo Plus"}
        </Text>
        <Text style={[styles.heroSubtitle, { color: colors.textMuted }]}>
          {active
            ? plus.backendActive
              ? "Your supporter access is active and synced."
              : "Your supporter access is active on this device and syncing."
            : "An early supporter plan for people who want OutGo to stay calm, useful and offline-first."}
        </Text>
      </View>

      <Card style={[styles.benefitsCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        {[
          "Support a calmer app that helps people meet offline.",
          "Keep your supporter access as Plus member features roll out.",
          "Help fund better discovery, hosting and safety tools without addictive feeds."
        ].map((benefit) => (
          <View key={benefit} style={styles.benefitRow}>
            <Check size={18} color={colors.accent} />
            <Text style={[styles.benefitText, { color: colors.text }]}>{benefit}</Text>
          </View>
        ))}
      </Card>

      <View style={styles.promiseGrid}>
        <Card style={[styles.promiseCard, { backgroundColor: colors.primarySofter, borderColor: colors.primary100 }]}>
          <Text style={[styles.promiseKicker, { color: colors.primary500 }]}>Available now</Text>
          <Text style={[styles.promiseBody, { color: colors.text }]}>
            Supporter access, purchase restore, and subscription status connected to your OutGo account.
          </Text>
        </Card>
        <Card style={[styles.promiseCard, { backgroundColor: colors.accentSoft, borderColor: `${colors.accent}55` }]}>
          <Text style={[styles.promiseKicker, { color: colors.accent }]}>Rolling out next</Text>
          <Text style={[styles.promiseBody, { color: colors.text }]}>
            Better hosting tools, richer discovery, and safety improvements for small real-life plans.
          </Text>
        </Card>
      </View>

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
              colors={colors}
              shadow={shadows.pin}
              onPress={() => {
                haptic("select");
                setSelectedPlan(plan.key);
              }}
            />
          ))}
        </View>
      ) : null}

      {!loadingOffering && !offeringError ? (
        <View style={styles.actions}>
          <Button
            title={active ? "OutGo Plus active" : "Continue"}
            variant="amber"
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
            onPress={() => {
              haptic("light");
              void handleRestore();
            }}
          />
        </View>
      ) : null}

      <Text style={[styles.storeNote, { color: colors.textMuted }]}>
        Your final subscription price is confirmed by the App Store or Google Play
        before checkout. Subscriptions renew automatically until cancelled.
      </Text>

      <View style={styles.legalLinks}>
        <LegalLink title="Terms" route="/legal/terms" />
        <Text style={[styles.legalDivider, { color: colors.textSubtle }]}>·</Text>
        <ExternalLegalLink
          title="Terms of Use (EULA)"
          url={APPLE_STANDARD_EULA_URL}
        />
        <Text style={[styles.legalDivider, { color: colors.textSubtle }]}>·</Text>
        <LegalLink title="Subscription Terms" route="/legal/subscriptions" />
        <Text style={[styles.legalDivider, { color: colors.textSubtle }]}>·</Text>
        <LegalLink title="Privacy" route="/legal/privacy" />
      </View>
    </Screen>
  );
}

function TopBar() {
  const { colors } = useAppTheme();

  return (
    <View style={styles.topBar}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border
          },
          pressed && styles.pressed
        ]}
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
  colors: ReturnType<typeof useAppTheme>["colors"];
  shadow: object;
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
  colors,
  shadow,
  onPress
}: PlanCardProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.planCard,
        {
          backgroundColor: selected ? colors.primarySofter : colors.surface,
          borderColor: selected ? colors.primary500 : colors.border
        },
        selected && shadow,
        disabled && styles.planCardDisabled,
        pressed && !disabled && styles.pressed
      ]}
    >
      <View style={styles.planTop}>
        <Text style={[styles.planTitle, { color: colors.text }]}>{title}</Text>
        {badge ? (
          <Text style={[styles.badge, { backgroundColor: colors.accent, color: colors.white }]}>
            {badge}
          </Text>
        ) : null}
      </View>
      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: colors.primaryDark }]}>{price}</Text>
        <Text style={[styles.cadence, { color: colors.textMuted }]}>{cadence}</Text>
      </View>
      <Text style={[styles.note, { color: colors.textMuted }]}>
        {disabled ? "Waiting for RevenueCat product setup." : note}
      </Text>
    </Pressable>
  );
}

function LegalLink({ title, route }: { title: string; route: "/legal/terms" | "/legal/privacy" | "/legal/subscriptions" }) {
  const { colors } = useAppTheme();

  return (
    <Pressable accessibilityRole="link" onPress={() => router.push(route)}>
      <Text style={[styles.legalLink, { color: colors.primary500 }]}>{title}</Text>
    </Pressable>
  );
}

function ExternalLegalLink({ title, url }: { title: string; url: string }) {
  const { colors } = useAppTheme();
  const handlePress = async () => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert("Could not open link", "Please try again in a moment.");
    }
  };

  return (
    <Pressable accessibilityRole="link" onPress={handlePress}>
      <Text style={[styles.legalLink, { color: colors.primary500 }]}>{title}</Text>
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
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  pressed: {
    opacity: 0.82
  },
  header: {
    gap: spacing.md,
    alignItems: "center"
  },
  iconCircle: {
    width: 78,
    height: 78,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden"
  },
  logo: {
    width: 78,
    height: 78
  },
  heroTitle: {
    ...textStyles.title,
    textAlign: "center"
  },
  heroSubtitle: {
    ...textStyles.body,
    textAlign: "center"
  },
  benefitsCard: {
    gap: spacing.md
  },
  benefitRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm
  },
  benefitText: {
    ...textStyles.body,
    fontFamily: fontFamilies.semiBold,
    flex: 1
  },
  promiseGrid: {
    gap: spacing.md
  },
  promiseCard: {
    gap: spacing.xs,
    borderWidth: 1
  },
  promiseKicker: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    textTransform: "uppercase"
  },
  promiseBody: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  },
  planList: {
    gap: spacing.md
  },
  planCard: {
    borderRadius: radii.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    gap: spacing.sm
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
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
  },
  badge: {
    ...textStyles.tiny,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden"
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm
  },
  price: {
    ...textStyles.title
  },
  cadence: {
    ...textStyles.small,
    paddingBottom: spacing.xs
  },
  note: {
    ...textStyles.small
  },
  actions: {
    gap: spacing.md
  },
  storeNote: {
    ...textStyles.small,
    textAlign: "center"
  },
  legalLinks: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: spacing.sm
  },
  legalLink: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  },
  legalDivider: {
    ...textStyles.small
  }
});
