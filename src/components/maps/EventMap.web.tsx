import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/lib/theme";
import type { Coordinates } from "@/lib/distance";
import type { EventWithMeta } from "@/types/domain";

type EventMapProps = {
  events: EventWithMeta[];
  center: Coordinates;
  hasDeviceOrigin: boolean;
  onEventPress: (event: EventWithMeta) => void;
};

export function EventMap(_props: EventMapProps) {
  return (
    <View style={styles.fallback}>
      <Text style={styles.title}>Map preview is available in the iOS and Android app.</Text>
      <Text style={styles.text}>Use the list below to browse this week&apos;s plans on web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.surfaceMuted
  },
  title: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900",
    textAlign: "center"
  },
  text: {
    color: colors.textMuted,
    fontSize: typography.small,
    textAlign: "center"
  }
});
