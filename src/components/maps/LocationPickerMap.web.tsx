import { StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/hooks/useAppTheme";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import type { Coordinates } from "@/lib/distance";

type LocationPickerMapProps = {
  coordinate: Coordinates | null;
  onCoordinateChange: (coordinate: Coordinates) => void;
};

export function LocationPickerMap({ coordinate }: LocationPickerMapProps) {
  const { colors } = useAppTheme();

  return (
    <View style={[styles.unavailable, { backgroundColor: colors.surfaceMuted }]}>
      <Text style={[styles.unavailableTitle, { color: colors.text }]}>
        Map pin picker is available in the mobile app.
      </Text>
      <Text style={[styles.unavailableText, { color: colors.textMuted }]}>
        {coordinate
          ? "A place has been selected. Use search again to adjust it on web."
          : "Use place search or current location to set coordinates on web."}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  unavailable: {
    minHeight: 150,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    padding: spacing.lg
  },
  unavailableTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    textAlign: "center"
  },
  unavailableText: {
    ...textStyles.small,
    textAlign: "center"
  }
});
