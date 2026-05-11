import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { format, parseISO } from "date-fns";
import { router } from "expo-router";
import { CalendarPlus, CreditCard, Edit3, RefreshCw, Settings, ShieldCheck } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientSurface } from "@/components/ui/GradientSurface";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColors } from "@/hooks/useAppTheme";
import { usePlusStatus } from "@/hooks/usePlusStatus";
import { signOut } from "@/services/supabase/auth";
import { getProfileStats } from "@/services/supabase/profiles";
import {
  hasActiveRevenueCatEntitlement,
  restoreRevenueCatPurchases
} from "@/lib/revenuecat";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import type { ProfileStats } from "@/types/domain";

export default function ProfileScreen() {
  const colors = useThemeColors();
  const { profile } = useAuth();
  const plus = usePlusStatus();
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);
  const [restoringPurchases, setRestoringPurchases] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (!profile?.id) {
      setStats(null);
      return;
    }

    setStatsLoading(true);
    getProfileStats(profile.id)
      .then((nextStats) => {
        if (mounted) {
          setStats(nextStats);
        }
      })
      .catch((error) => {
        if (__DEV__) {
          console.warn("Could not load profile stats", error);
        }
      })
      .finally(() => {
        if (mounted) {
          setStatsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [profile?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Could not sign out", error instanceof Error ? error.message : "Try again.");
    }
  };

  const handleRestorePurchases = async () => {
    setRestoringPurchases(true);
    try {
      const customerInfo = await restoreRevenueCatPurchases();
      await plus.refresh();

      if (hasActiveRevenueCatEntitlement(customerInfo)) {
        Alert.alert("Restored", "OutGo Plus is active on this account.");
        return;
      }

      Alert.alert("No active subscription", "No active OutGo Plus purchase was found.");
    } catch (error) {
      Alert.alert(
        "Could not restore purchases",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setRestoringPurchases(false);
    }
  };

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          title="Profile needed"
          message="Finish your profile before joining offline plans."
          actionTitle="Edit profile"
          onAction={() =>
            router.push({ pathname: "/profile/edit", params: { returnTo: "/profile" } })
          }
        />
      </Screen>
    );
  }

  const memberSince = stats?.memberSince
    ? format(parseISO(stats.memberSince), "MMM yyyy")
    : "New";
  const plusActive = plus.active;
  const plusDescription = plusActive
    ? plus.backendActive && !plus.sdkActive
      ? "Your OutGo Plus subscription is active and synced from RevenueCat."
      : "Your OutGo Plus subscription is active."
    : plus.backendStatus
      ? "Your previous Plus access is not active right now. Restore or resubscribe to continue."
      : plus.available
      ? "Support OutGo and keep Plus access synced with your profile."
      : plus.unavailableMessage ?? "Subscriptions are available in native builds.";

  return (
    <Screen>
      <SectionHeader
        title="Profile"
        subtitle="Enough context to feel human, not enough to turn into a performance."
        right={
          <Button
            title="Settings"
            variant="secondary"
            icon={<Settings size={18} color={colors.primaryDark} />}
            onPress={() => router.push("/settings")}
            style={styles.smallButton}
          />
        }
      />
      <GradientSurface variant="soft" style={[styles.profileCard, { borderColor: colors.border }]}>
        <Avatar size={92} name={profile.full_name} url={profile.avatar_url} />
        <View style={styles.profileCopy}>
          <Text style={[styles.name, { color: colors.text }]}>{profile.full_name}</Text>
          <Text style={[styles.username, { color: colors.primary500 }]}>@{profile.username}</Text>
          <Text style={[styles.city, { color: colors.textMuted }]}>{profile.city}</Text>
        </View>
        {profile.bio ? <Text style={[styles.bio, { color: colors.text }]}>{profile.bio}</Text> : null}

        {statsLoading ? <LoadingState message="Loading profile stats..." /> : null}
        <View style={styles.statsGrid}>
          <Stat title="Plans joined" value={String(stats?.plansJoined ?? 0)} />
          <Stat title="Plans hosted" value={String(stats?.plansHosted ?? 0)} />
          <Stat title="Member since" value={memberSince} />
        </View>

        <ProfileChips title="I'm into" values={profile.interests} />
        <ProfileChips title="Offline style" values={profile.hobbies} />
        <ProfileChips title="Life context" values={profile.life_context} />
        <ProfileChips title="I'm here for" values={profile.social_goals} />
      </GradientSurface>

      <Card style={[styles.subscriptionCard, { borderColor: plusActive ? colors.success : colors.primary100 }]}>
        <View style={styles.subscriptionHeader}>
          <View style={[styles.subscriptionIcon, { backgroundColor: plusActive ? colors.successSoft : colors.accentSoft }]}>
            <CreditCard size={22} color={plusActive ? colors.success : colors.accent} />
          </View>
          <View style={styles.subscriptionCopy}>
            <Text style={[styles.subscriptionTitle, { color: colors.text }]}>OutGo Plus</Text>
            <Text style={[styles.subscriptionText, { color: colors.textMuted }]}>{plusDescription}</Text>
          </View>
        </View>
        <View style={styles.subscriptionActions}>
          <Button
            title={plusActive ? "View Plus" : "Open Plus"}
            variant={plusActive ? "secondary" : "amber"}
            icon={<CreditCard size={18} color={plusActive ? colors.primaryDark : colors.white} />}
            onPress={() => router.push("/paywall")}
            style={styles.subscriptionButton}
          />
          <Button
            title="Restore"
            variant="secondary"
            loading={restoringPurchases || plus.loading}
            disabled={!plus.available}
            icon={<RefreshCw size={18} color={colors.primaryDark} />}
            onPress={handleRestorePurchases}
            style={styles.subscriptionButton}
          />
        </View>
      </Card>

      <Card style={styles.safety}>
        <ShieldCheck size={22} color={colors.success} />
        <View style={styles.safetyCopy}>
          <Text style={[styles.safetyTitle, { color: colors.text }]}>Community baseline</Text>
          <Text style={[styles.safetyText, { color: colors.textMuted }]}>
            Meet in public places, keep plans low-pressure, respect boundaries
            and report anything that feels off.
          </Text>
        </View>
      </Card>

      <Button
        title="Host a plan"
        variant="secondary"
        icon={<CalendarPlus size={18} color={colors.primaryDark} />}
        onPress={() => router.push("/create-event")}
      />
      <Button
        title="Edit profile"
        icon={<Edit3 size={18} color={colors.white} />}
        onPress={() =>
          router.push({ pathname: "/profile/edit", params: { returnTo: "/profile" } })
        }
      />
      <Button title="Sign out" variant="ghost" onPress={handleSignOut} />
    </Screen>
  );
}

function Stat({ title, value }: { title: string; value: string }) {
  const colors = useThemeColors();

  return (
    <View style={[styles.statCard, { backgroundColor: colors.primarySofter }]}>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
      <Text style={[styles.statTitle, { color: colors.textMuted }]}>{title}</Text>
    </View>
  );
}

function ProfileChips({ title, values }: { title: string; values: string[] }) {
  const colors = useThemeColors();

  if (!values.length) {
    return null;
  }

  return (
    <View style={styles.chipSection}>
      <Text style={[styles.chipTitle, { color: colors.textMuted }]}>{title}</Text>
      <View style={styles.interests}>
        {values.map((value) => (
          <Text
            key={`${title}-${value}`}
            style={[
              styles.interest,
              { backgroundColor: colors.infoSoft, color: colors.text }
            ]}
          >
            {value}
          </Text>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  smallButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  profileCard: {
    alignItems: "center",
    gap: spacing.md,
    borderWidth: 1,
    padding: spacing.xl
  },
  profileCopy: {
    alignItems: "center",
    gap: spacing.xs
  },
  name: {
    ...textStyles.heading,
    fontFamily: fontFamilies.extraBold
  },
  username: {
    ...textStyles.body,
    fontFamily: fontFamilies.bold
  },
  city: {
    ...textStyles.small
  },
  bio: {
    ...textStyles.body,
    textAlign: "center"
  },
  statsGrid: {
    alignSelf: "stretch",
    flexDirection: "row",
    gap: spacing.sm
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: spacing.md,
    gap: spacing.xs,
    alignItems: "center"
  },
  statValue: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    textAlign: "center"
  },
  statTitle: {
    ...textStyles.tiny,
    textAlign: "center"
  },
  chipSection: {
    alignSelf: "stretch",
    gap: spacing.sm
  },
  chipTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    textAlign: "center"
  },
  interests: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: spacing.sm
  },
  interest: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    overflow: "hidden"
  },
  safety: {
    flexDirection: "row",
    gap: spacing.md
  },
  subscriptionCard: {
    gap: spacing.md,
    borderWidth: 1.5
  },
  subscriptionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  subscriptionIcon: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center"
  },
  subscriptionCopy: {
    flex: 1,
    gap: spacing.xs
  },
  subscriptionTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  subscriptionText: {
    ...textStyles.small
  },
  subscriptionActions: {
    flexDirection: "row",
    gap: spacing.sm
  },
  subscriptionButton: {
    flex: 1,
    paddingHorizontal: spacing.md
  },
  safetyCopy: {
    flex: 1,
    gap: spacing.xs
  },
  safetyTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  safetyText: {
    ...textStyles.small
  }
});
