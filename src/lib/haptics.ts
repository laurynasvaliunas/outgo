import { Platform } from "react-native";
import * as Haptics from "expo-haptics";

export type HapticIntent = "light" | "select" | "success" | "warning";

export function haptic(intent: HapticIntent = "light") {
  if (Platform.OS === "web") {
    return;
  }

  const run = async () => {
    if (intent === "select") {
      await Haptics.selectionAsync();
      return;
    }

    if (intent === "success") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return;
    }

    if (intent === "warning") {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  void run().catch(() => {
    // Haptics are a nice-to-have polish layer.
  });
}
