import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import * as Device from "expo-device";
import { Bell, BellRing } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { isProfileComplete } from "@/services/supabase/profiles";
import {
  addNotificationResponseListener,
  addPushTokenListener,
  getLastNotificationResponse,
  handleNotificationResponse,
  registerForPushNotifications,
  syncPushToken
} from "@/services/supabase/notifications";
import { useAuth } from "@/hooks/useAuth";
import { useAppTheme } from "@/hooks/useAppTheme";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";

function getPromptStorageKey(userId: string) {
  return `outgo.pushPromptHandled.${userId}`;
}

function hasSeenPrompt(userId: string) {
  try {
    return localStorage.getItem(getPromptStorageKey(userId)) === "true";
  } catch {
    return true;
  }
}

function markPromptSeen(userId: string) {
  try {
    localStorage.setItem(getPromptStorageKey(userId), "true");
  } catch {
    // If local persistence is unavailable, avoid blocking notification setup.
  }
}

function getRemindAfterStorageKey(userId: string) {
  return `outgo.pushPromptRemindAfter.${userId}`;
}

function shouldWaitForReminder(userId: string) {
  try {
    const value = localStorage.getItem(getRemindAfterStorageKey(userId));
    return value ? Number(value) > Date.now() : false;
  } catch {
    return false;
  }
}

function remindLater(userId: string) {
  try {
    localStorage.setItem(
      getRemindAfterStorageKey(userId),
      String(Date.now() + 1000 * 60 * 60 * 48)
    );
  } catch {
    // Reminder persistence is best-effort.
  }
}

export function NotificationBridge() {
  const { loading, profile, user } = useAuth();
  const { colors, shadows } = useAppTheme();
  const handledInitialResponse = useRef(false);
  const promptedUserRef = useRef<string | null>(null);
  const [promptUserId, setPromptUserId] = useState<string | null>(null);
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    const responseSubscription = addNotificationResponseListener();

    if (!handledInitialResponse.current) {
      handledInitialResponse.current = true;
      getLastNotificationResponse()
        .then(handleNotificationResponse)
        .catch((error) => {
          if (__DEV__) {
            console.warn("Could not read initial notification response", error);
          }
        });
    }

    return () => {
      responseSubscription.remove();
    };
  }, []);

  useEffect(() => {
    if (!user?.id) {
      return undefined;
    }

    const tokenSubscription = addPushTokenListener(user.id);
    return () => {
      tokenSubscription.remove();
    };
  }, [user?.id]);

  useEffect(() => {
    if (loading || !user?.id || !isProfileComplete(profile)) {
      return;
    }

    void syncPushToken(user.id).catch((error) => {
      if (__DEV__) {
        console.warn("Could not sync push token", error);
      }
    });

    if (
      Platform.OS === "web" ||
      !Device.isDevice ||
      hasSeenPrompt(user.id) ||
      shouldWaitForReminder(user.id) ||
      promptedUserRef.current === user.id
    ) {
      return;
    }

    promptedUserRef.current = user.id;
    setPromptUserId(user.id);
  }, [loading, profile, user?.id]);

  const closePrompt = () => {
    if (promptUserId) {
      markPromptSeen(promptUserId);
    }
    setPromptUserId(null);
  };

  const handleRemindLater = () => {
    if (promptUserId) {
      remindLater(promptUserId);
    }
    setPromptUserId(null);
  };

  const handleEnable = async () => {
    if (!promptUserId) {
      return;
    }

    setRegistering(true);
    try {
      const token = await registerForPushNotifications(promptUserId);
      markPromptSeen(promptUserId);
      setPromptUserId(null);
      if (!token) {
        Alert.alert(
          "Notifications are off",
          "Turn on notifications for OutGo in your phone settings when you want plan reminders and chat updates."
        );
      }
    } catch (error) {
      Alert.alert(
        "Could not enable notifications",
        error instanceof Error ? error.message : "Please try again in Settings."
      );
    } finally {
      setRegistering(false);
    }
  };

  if (!promptUserId) {
    return null;
  }

  return (
    <View pointerEvents="box-none" style={styles.overlay}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Dismiss notification reminder"
        onPress={handleRemindLater}
        style={styles.scrim}
      />
      <View
        style={[
          styles.card,
          {
            backgroundColor: colors.surface,
            borderColor: colors.border,
            ...shadows.medium
          }
        ]}
      >
        <View style={[styles.iconWrap, { backgroundColor: colors.primarySofter }]}>
          <BellRing size={24} color={colors.primary500} />
        </View>
        <View style={styles.copy}>
          <Text style={[styles.title, { color: colors.text }]}>Stay close to your plans</Text>
          <Text style={[styles.message, { color: colors.textMuted }]}>
            Get reminders, host changes and event chat updates for plans you join.
          </Text>
        </View>
        <View style={styles.actions}>
          <Button
            title="Not now"
            variant="ghost"
            icon={<Bell size={17} color={colors.primary500} />}
            onPress={closePrompt}
            style={styles.secondaryAction}
          />
          <Button
            title="Remind me later"
            variant="secondary"
            onPress={handleRemindLater}
            style={styles.secondaryAction}
          />
          <Button
            title="Enable"
            loading={registering}
            onPress={handleEnable}
            style={styles.primaryAction}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 30,
    justifyContent: "flex-end"
  },
  scrim: {
    ...StyleSheet.absoluteFillObject
  },
  card: {
    margin: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.lg,
    gap: spacing.md
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    gap: spacing.xs
  },
  title: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
  },
  message: {
    ...textStyles.small
  },
  actions: {
    gap: spacing.sm
  },
  primaryAction: {
    minHeight: 46
  },
  secondaryAction: {
    minHeight: 42
  }
});
