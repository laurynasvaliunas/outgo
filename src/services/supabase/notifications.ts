import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { router } from "expo-router";
import { supabase } from "./client";
import type { Database } from "@/types/database";
import type {
  NotificationPreferences,
  PushNotificationData
} from "@/types/domain";

type PreferenceUpdate =
  Database["public"]["Tables"]["notification_preferences"]["Update"];

const DEFAULT_PREFERENCES = {
  master_enabled: true,
  chat_messages: true,
  event_reminders: true,
  host_updates: true,
  joins: true,
  safety_updates: true
};

export const NOTIFICATION_CHANNEL_ID = "outgo-default";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

function getProjectId() {
  return (
    Constants.expoConfig?.extra?.eas?.projectId ??
    Constants.easConfig?.projectId
  );
}

function getDevicePlatform() {
  if (Platform.OS === "ios" || Platform.OS === "android" || Platform.OS === "web") {
    return Platform.OS;
  }
  return "unknown";
}

function getDeviceName() {
  const model = Device.modelName ?? "Unknown device";
  return Device.osName ? `${Device.osName} ${model}` : model;
}

async function configureAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(NOTIFICATION_CHANNEL_ID, {
    name: "OutGo",
    importance: Notifications.AndroidImportance.DEFAULT,
    vibrationPattern: [0, 220, 180, 220],
    lightColor: "#3A4BBF"
  });
}

export async function getNotificationPermissionStatus() {
  if (Platform.OS === "web") {
    return "unavailable" as const;
  }

  const permissions = await Notifications.getPermissionsAsync();
  return permissions.status;
}

export async function ensureNotificationPreferences(userId: string) {
  const { error } = await supabase.rpc("ensure_notification_preferences", {
    target_user_id: userId
  });

  if (error) {
    throw error;
  }
}

export async function getNotificationPreferences(
  userId: string
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return {
    user_id: userId,
    ...DEFAULT_PREFERENCES,
    ...(data ?? {})
  };
}

export async function upsertNotificationPreferences(
  userId: string,
  preferences: PreferenceUpdate
): Promise<NotificationPreferences> {
  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: userId,
        ...preferences
      },
      { onConflict: "user_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return {
    ...DEFAULT_PREFERENCES,
    ...data
  };
}

export async function syncPushToken(userId: string) {
  if (Platform.OS === "web" || !Device.isDevice) {
    return null;
  }

  await configureAndroidChannel();

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.status !== "granted") {
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    throw new Error("Expo project ID is missing from app config.");
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await upsertPushToken(userId, token.data);
  await ensureNotificationPreferences(userId);
  return token.data;
}

export async function registerForPushNotifications(userId: string) {
  if (Platform.OS === "web") {
    return null;
  }

  if (!Device.isDevice) {
    throw new Error("Push notifications require a physical device.");
  }

  await configureAndroidChannel();

  const existing = await Notifications.getPermissionsAsync();
  let finalStatus = existing.status;

  if (existing.status !== "granted") {
    const requested = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true
      }
    });
    finalStatus = requested.status;
  }

  if (finalStatus !== "granted") {
    await upsertNotificationPreferences(userId, { master_enabled: false });
    return null;
  }

  const projectId = getProjectId();
  if (!projectId) {
    throw new Error("Expo project ID is missing from app config.");
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  await upsertPushToken(userId, token.data);
  await ensureNotificationPreferences(userId);
  await upsertNotificationPreferences(userId, { master_enabled: true });
  return token.data;
}

export async function upsertPushToken(userId: string, expoPushToken: string) {
  const { error } = await supabase.from("push_tokens").upsert(
    {
      user_id: userId,
      expo_push_token: expoPushToken,
      device_platform: getDevicePlatform(),
      device_name: getDeviceName(),
      active: true,
      disabled_at: null,
      disabled_reason: null,
      last_seen_at: new Date().toISOString()
    },
    { onConflict: "expo_push_token" }
  );

  if (error) {
    throw error;
  }
}

export async function disableCurrentPushToken(reason = "signed_out") {
  if (Platform.OS === "web" || !Device.isDevice) {
    return;
  }

  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.status !== "granted") {
    return;
  }

  const projectId = getProjectId();
  if (!projectId) {
    return;
  }

  const token = await Notifications.getExpoPushTokenAsync({ projectId });
  const { error } = await supabase
    .from("push_tokens")
    .update({
      active: false,
      disabled_at: new Date().toISOString(),
      disabled_reason: reason
    })
    .eq("expo_push_token", token.data);

  if (error) {
    throw error;
  }
}

export function handleNotificationResponse(
  response: Notifications.NotificationResponse | null
) {
  if (!response) {
    return;
  }

  const data = response.notification.request.content.data as PushNotificationData;
  if (data.type === "event_chat" && data.eventId) {
    router.push(`/event/${data.eventId}/chat`);
    return;
  }

  if (
    (data.type === "event_joined" ||
      data.type === "event_update" ||
      data.type === "event_cancelled" ||
      data.type === "event_reminder") &&
    data.eventId
  ) {
    router.push(`/event/${data.eventId}`);
    return;
  }

  if (data.type === "report_update") {
    router.push("/settings");
  }
}

export function addNotificationResponseListener() {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    handleNotificationResponse(response);
  });
}

export function addPushTokenListener(userId: string) {
  return Notifications.addPushTokenListener((token) => {
    void upsertPushToken(userId, token.data);
  });
}

export async function getLastNotificationResponse() {
  return Notifications.getLastNotificationResponseAsync();
}
