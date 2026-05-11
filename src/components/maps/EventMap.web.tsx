import { StyleSheet, Text, View } from "react-native";
import { useThemeColors } from "@/hooks/useAppTheme";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import type { Coordinates } from "@/lib/distance";
import type { EventWithMeta } from "@/types/domain";

type EventMapProps = {
  events: EventWithMeta[];
  center: Coordinates;
  hasDeviceOrigin: boolean;
  compassTopInset?: number;
  selectedEventId?: string | null;
  onEventPress: (event: EventWithMeta) => void;
};

export function EventMap(_props: EventMapProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.fallback, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.title, { color: colors.text }]}>Map preview is available in the iOS and Android app.</Text>
      <Text style={[styles.text, { color: colors.textMuted }]}>Use the list below to browse this week&apos;s plans on web.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl
  },
  title: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    textAlign: "center"
  },
  text: {
    ...textStyles.small,
    textAlign: "center"
  }
});
