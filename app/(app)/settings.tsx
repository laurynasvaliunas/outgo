import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Alert, StyleSheet, Switch, Text, View } from "react-native";
import { router } from "expo-router";
import {
  Bell,
  Bug,
  Edit3,
  FileText,
  Lock,
  LogOut,
  ShieldAlert
} from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { GradientSurface } from "@/components/ui/GradientSurface";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAppTheme, type ThemePreference } from "@/hooks/useAppTheme";
import { useAuth } from "@/hooks/useAuth";
import { changePassword, signOut } from "@/services/supabase/auth";
import { deleteCurrentAccount } from "@/services/supabase/account";
import {
  disableCurrentPushToken,
  getNotificationPermissionStatus,
  getNotificationPreferences,
  registerForPushNotifications,
  upsertNotificationPreferences
} from "@/services/supabase/notifications";
import type { NotificationPreferences } from "@/types/domain";
import { Sentry } from "@/lib/sentry";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";

const appearanceOptions: { label: string; value: ThemePreference }[] = [
  { label: "System", value: "system" },
  { label: "Light", value: "light" },
  { label: "Dark", value: "dark" }
];

type NotificationPreferenceKey =
  | "chat_messages"
  | "event_reminders"
  | "host_updates"
  | "joins"
  | "safety_updates";

const notificationPreferenceRows: {
  key: NotificationPreferenceKey;
  title: string;
  description: string;
}[] = [
  {
    key: "chat_messages",
    title: "Event chat",
    description: "Messages from plans you joined or host."
  },
  {
    key: "event_reminders",
    title: "Plan reminders",
    description: "24 hours and 1 hour before joined or hosted plans."
  },
  {
    key: "host_updates",
    title: "Host and event updates",
    description: "Changes, cancellations and important plan details."
  },
  {
    key: "joins",
    title: "New joins",
    description: "When someone joins a plan you host."
  },
  {
    key: "safety_updates",
    title: "Safety and reports",
    description: "Updates on reports and important safety actions."
  }
];

export default function SettingsScreen() {
  const { colors, preference, setPreference } = useAppTheme();
  const { profile, user } = useAuth();
  const [passwordExpanded, setPasswordExpanded] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPassword, setChangingPassword] = useState(false);
  const [deleteExpanded, setDeleteExpanded] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);
  const [notificationPreferences, setNotificationPreferences] =
    useState<NotificationPreferences | null>(null);
  const [notificationPermission, setNotificationPermission] = useState("unknown");
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [savingNotificationKey, setSavingNotificationKey] = useState<
    "master_enabled" | NotificationPreferenceKey | null
  >(null);

  useEffect(() => {
    if (!user?.id) {
      setNotificationPreferences(null);
      setNotificationPermission("unknown");
      setLoadingNotifications(false);
      return;
    }

    let mounted = true;
    setLoadingNotifications(true);

    Promise.all([
      getNotificationPreferences(user.id),
      getNotificationPermissionStatus()
    ])
      .then(([preferences, permission]) => {
        if (!mounted) {
          return;
        }
        setNotificationPreferences(preferences);
        setNotificationPermission(permission);
      })
      .catch((error) => {
        if (mounted) {
          setNotificationPermission("error");
        }
        if (__DEV__) {
          console.warn("Could not load notification settings", error);
        }
      })
      .finally(() => {
        if (mounted) {
          setLoadingNotifications(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
      router.replace("/login");
    } catch (error) {
      Alert.alert("Could not sign out", error instanceof Error ? error.message : "Try again.");
    }
  };

  const handlePasswordChange = async () => {
    if (newPassword.length < 6) {
      Alert.alert("Password too short", "Use at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Passwords do not match", "Confirm your new password again.");
      return;
    }

    setChangingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Password updated", "Use your new password the next time you sign in.");
    } catch (error) {
      Alert.alert(
        "Could not change password",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== "DELETE") {
      Alert.alert("Confirmation needed", "Type DELETE to confirm account deletion.");
      return;
    }

    setDeletingAccount(true);
    try {
      await deleteCurrentAccount(deleteConfirmation);
      Alert.alert(
        "Account deleted",
        "Your OutGo account was deleted. App Store subscriptions must be cancelled separately in your Apple account settings."
      );
      await signOut().catch(() => undefined);
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Could not delete account",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setDeletingAccount(false);
    }
  };

  const handleNotificationToggle = async (
    key: "master_enabled" | NotificationPreferenceKey,
    value: boolean
  ) => {
    if (!user?.id) {
      Alert.alert("Sign in needed", "Please sign in to manage notifications.");
      return;
    }

    const currentPreferences =
      notificationPreferences ?? (await getNotificationPreferences(user.id));

    setSavingNotificationKey(key);
    try {
      let nextPreferences: NotificationPreferences = {
        ...currentPreferences,
        [key]: value
      };

      if (key === "master_enabled" && value) {
        const token = await registerForPushNotifications(user.id);
        const permission = await getNotificationPermissionStatus();
        setNotificationPermission(permission);
        if (!token) {
          Alert.alert(
            "Notifications are off",
            "Turn on notifications for OutGo in your phone settings to receive plan and chat updates."
          );
          nextPreferences = await upsertNotificationPreferences(user.id, {
            master_enabled: false
          });
          setNotificationPreferences(nextPreferences);
          return;
        }
      }

      if (key === "master_enabled" && !value) {
        await disableCurrentPushToken("disabled_in_settings");
      }

      nextPreferences = await upsertNotificationPreferences(user.id, {
        [key]: value
      });
      setNotificationPreferences(nextPreferences);
    } catch (error) {
      Alert.alert(
        "Could not update notifications",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSavingNotificationKey(null);
    }
  };

  return (
    <Screen>
      <SectionHeader title="Settings" subtitle="Practical controls for a quieter app." />

      <GradientSurface variant="soft" style={[styles.section, styles.featuredSection, { borderColor: colors.border }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
        <SettingRow
          title="Profile"
          description={profile?.city ? `${profile.city} · @{profile.username}` : "Finish your public profile."}
          icon={<Edit3 size={22} color={colors.primary500} />}
        />
        <Button
          title="Edit profile"
          variant="secondary"
          icon={<Edit3 size={18} color={colors.primaryDark} />}
          onPress={() =>
            router.push({ pathname: "/profile/edit", params: { returnTo: "/settings" } })
          }
        />
      </GradientSurface>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Appearance</Text>
        <Text style={[styles.rowText, { color: colors.textMuted }]}>
          Match your phone, stay bright, or switch to a calmer dark theme.
        </Text>
        <SegmentedControl
          options={appearanceOptions}
          value={preference}
          onChange={setPreference}
        />
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Password</Text>
        <Button
          title={passwordExpanded ? "Hide password form" : "Change password"}
          variant="secondary"
          icon={<Lock size={18} color={colors.primaryDark} />}
          onPress={() => setPasswordExpanded((expanded) => !expanded)}
        />
        {passwordExpanded ? (
          <>
            <Input
              label="Current password"
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
              placeholder="Current password"
            />
            <Input
              label="New password"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
              placeholder="At least 6 characters"
            />
            <Input
              label="Confirm new password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              placeholder="Repeat new password"
            />
            <Button
              title="Save new password"
              loading={changingPassword}
              icon={<Lock size={18} color={colors.white} />}
              onPress={handlePasswordChange}
            />
          </>
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Notifications</Text>
        <SettingRow
          title="Plans and chat updates"
          description={
            notificationPermission === "granted"
              ? "Device permission is enabled."
              : notificationPermission === "denied"
                ? "Device permission is denied. Enable OutGo notifications in iOS Settings."
                : notificationPermission === "error"
                  ? "Could not load notification status. Try again later."
                  : "Get reminders, host changes and event chat for plans you join."
          }
          icon={<Bell size={22} color={colors.primary500} />}
        />
        <NotificationToggleRow
          title="Enable notifications"
          description="Master switch for transactional OutGo notifications."
          value={Boolean(notificationPreferences?.master_enabled)}
          disabled={loadingNotifications}
          loading={loadingNotifications || savingNotificationKey === "master_enabled"}
          onValueChange={(value) => handleNotificationToggle("master_enabled", value)}
        />
        {notificationPreferenceRows.map((row) => (
          <NotificationToggleRow
            key={row.key}
            title={row.title}
            description={row.description}
            value={Boolean(notificationPreferences?.[row.key])}
            disabled={loadingNotifications || !notificationPreferences?.master_enabled}
            loading={loadingNotifications || savingNotificationKey === row.key}
            onValueChange={(value) => handleNotificationToggle(row.key, value)}
          />
        ))}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>App</Text>
        <SettingRow
          title="Moderation"
          description="Reports are stored for an admin workflow with open/reviewed/dismissed status."
          icon={<ShieldAlert size={22} color={colors.danger} />}
        />
        <Button
          title="Legal information"
          variant="secondary"
          icon={<FileText size={18} color={colors.primaryDark} />}
          onPress={() => router.push("/legal")}
        />
        {__DEV__ ? (
          <Button
            title="Send Sentry test message"
            variant="secondary"
            icon={<Bug size={18} color={colors.primaryDark} />}
            onPress={() => {
              Sentry.captureMessage("OutGo Sentry test");
              Alert.alert("Sent", "Sentry test message captured if DSN is configured.");
            }}
          />
        ) : null}
      </Card>

      <Card style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account deletion</Text>
        <Text style={[styles.rowText, { color: colors.textMuted }]}>
          Delete your OutGo account and profile data. This does not cancel App Store
          or Google Play subscriptions.
        </Text>
        <Button
          title={deleteExpanded ? "Hide delete account" : "Delete account"}
          variant="danger"
          onPress={() => setDeleteExpanded((expanded) => !expanded)}
        />
        {deleteExpanded ? (
          <>
            <Input
              label="Type DELETE to confirm"
              value={deleteConfirmation}
              onChangeText={setDeleteConfirmation}
              autoCapitalize="characters"
              placeholder="DELETE"
            />
            <Button
              title="Permanently delete account"
              variant="danger"
              loading={deletingAccount}
              disabled={deleteConfirmation !== "DELETE"}
              onPress={handleDeleteAccount}
            />
          </>
        ) : null}
      </Card>

      <Button
        title="Sign out"
        variant="danger"
        icon={<LogOut size={18} color={colors.white} />}
        onPress={handleSignOut}
      />
    </Screen>
  );
}

function NotificationToggleRow({
  title,
  description,
  value,
  disabled,
  loading,
  onValueChange
}: {
  title: string;
  description: string;
  value: boolean;
  disabled?: boolean;
  loading?: boolean;
  onValueChange: (value: boolean) => void;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.preferenceRow, disabled && styles.disabledRow]}>
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowText, { color: colors.textMuted }]}>{description}</Text>
      </View>
      <Switch
        value={value}
        disabled={disabled || loading}
        onValueChange={onValueChange}
        trackColor={{ true: colors.primary100, false: colors.border }}
        thumbColor={value ? colors.primary500 : colors.textMuted}
      />
    </View>
  );
}

function SettingRow({
  title,
  description,
  icon
}: {
  title: string;
  description: string;
  icon: ReactNode;
}) {
  const { colors } = useAppTheme();

  return (
    <View style={styles.moderation}>
      {icon}
      <View style={styles.rowCopy}>
        <Text style={[styles.rowTitle, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.rowText, { color: colors.textMuted }]}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.md
  },
  featuredSection: {
    borderWidth: 1,
    padding: spacing.lg
  },
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
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md,
    paddingVertical: spacing.xs
  },
  disabledRow: {
    opacity: 0.58
  },
  rowCopy: {
    flex: 1,
    gap: spacing.xs
  },
  sectionTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  rowTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  rowText: {
    ...textStyles.small
  }
});
