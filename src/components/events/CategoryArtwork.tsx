import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { categoryMeta } from "@/lib/categories";
import { categoryGradients, fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import type { EventCategory } from "@/types/domain";

type CategoryArtworkProps = {
  category: EventCategory;
  label?: string;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function CategoryArtwork({
  category,
  label,
  compact,
  style
}: CategoryArtworkProps) {
  const { colors } = useAppTheme();
  const meta = categoryMeta[category];

  return (
    <LinearGradient
      colors={categoryGradients[category]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.frame, compact && styles.compactFrame, style]}
    >
      <View style={[styles.band, styles.bandOne]} />
      <View style={[styles.band, styles.bandTwo]} />
      <View style={[styles.tile, compact && styles.compactTile, { backgroundColor: `${colors.white}E8` }]}>
        <Text style={[styles.emoji, compact && styles.compactEmoji]}>{meta.emoji}</Text>
      </View>
      {label ? (
        <Text numberOfLines={1} style={[styles.label, { color: colors.white }]}>
          {label}
        </Text>
      ) : null}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  frame: {
    minHeight: 150,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    position: "relative"
  },
  compactFrame: {
    minHeight: 104
  },
  band: {
    position: "absolute",
    height: 42,
    width: "130%",
    opacity: 0.18,
    backgroundColor: "#FFFFFF",
    transform: [{ rotate: "-14deg" }]
  },
  bandOne: {
    top: 18,
    left: -36
  },
  bandTwo: {
    bottom: 16,
    right: -46
  },
  tile: {
    width: 78,
    height: 78,
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center"
  },
  compactTile: {
    width: 58,
    height: 58,
    borderRadius: radii.lg
  },
  emoji: {
    fontSize: 36,
    lineHeight: 44
  },
  compactEmoji: {
    fontSize: 28,
    lineHeight: 34
  },
  label: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.18)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4
  }
});
