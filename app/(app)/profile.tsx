import { Alert, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Edit3, Settings, ShieldCheck } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/services/supabase/auth";
import { colors, fontFamilies, spacing, textStyles } from "@/lib/theme";

export default function ProfileScreen() {
  const { profile } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Could not sign out", error instanceof Error ? error.message : "Try again.");
    }
  };

  if (!profile) {
    return (
      <Screen>
        <EmptyState
          title="Profile needed"
          message="Finish your profile before joining offline plans."
          actionTitle="Edit profile"
          onAction={() => router.push("/profile/edit")}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader
        title="Profile"
        subtitle="Keep it simple. Enough context to feel human, not enough to turn into a performance."
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
      <Card style={styles.profileCard}>
        <Avatar size={82} name={profile.full_name} url={profile.avatar_url} />
        <View style={styles.profileCopy}>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.username}>@{profile.username}</Text>
          <Text style={styles.city}>{profile.city}</Text>
        </View>
        {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
        {profile.interests.length > 0 ? (
          <View style={styles.interests}>
            {profile.interests.map((interest) => (
              <Text key={interest} style={styles.interest}>
                {interest}
              </Text>
            ))}
          </View>
        ) : null}
      </Card>

      <Card style={styles.safety}>
        <ShieldCheck size={22} color={colors.success} />
        <View style={styles.safetyCopy}>
          <Text style={styles.safetyTitle}>Community baseline</Text>
          <Text style={styles.safetyText}>
            Meet in public places, keep plans low-pressure, respect boundaries
            and report anything that feels off.
          </Text>
        </View>
      </Card>

      <Button
        title="Edit profile"
        icon={<Edit3 size={18} color="#FFFFFF" />}
        onPress={() => router.push("/profile/edit")}
      />
      <Button title="Sign out" variant="ghost" onPress={handleSignOut} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  smallButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  profileCard: {
    alignItems: "center",
    gap: spacing.md
  },
  profileCopy: {
    alignItems: "center",
    gap: spacing.xs
  },
  name: {
    ...textStyles.heading,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  username: {
    ...textStyles.body,
    fontFamily: fontFamilies.bold,
    color: colors.primary500
  },
  city: {
    ...textStyles.small,
    color: colors.textMuted,
  },
  bio: {
    ...textStyles.body,
    color: colors.text,
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
    backgroundColor: colors.infoSoft,
    color: colors.text,
  },
  safety: {
    flexDirection: "row",
    gap: spacing.md
  },
  safetyCopy: {
    flex: 1,
    gap: spacing.xs
  },
  safetyTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  safetyText: {
    ...textStyles.small,
    color: colors.textMuted,
  }
});
