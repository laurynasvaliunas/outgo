import { Pressable, StyleSheet, Text, View } from "react-native";
import { categoryMeta } from "@/lib/categories";
import { colors, fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import type { EventCategory } from "@/types/domain";

type CategoryPillProps = {
  category: EventCategory;
  selected?: boolean;
  onPress?: () => void;
  compact?: boolean;
};

export function CategoryPill({
  category,
  selected,
  onPress,
  compact
}: CategoryPillProps) {
  const meta = categoryMeta[category];
  const activeColor = meta.color;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.pill,
        compact && styles.compact,
        {
          backgroundColor: selected ? activeColor : `${activeColor}18`,
          borderColor: selected ? activeColor : `${activeColor}33`
        }
      ]}
    >
      <View style={[styles.emojiBubble, selected && styles.selectedEmoji]}>
        <Text style={styles.emoji}>{meta.emoji}</Text>
      </View>
      <Text
        numberOfLines={1}
        style={[styles.label, selected && styles.selectedLabel]}
      >
        {meta.label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingVertical: spacing.s,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    minHeight: 36,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  compact: {
    paddingHorizontal: spacing.sm
  },
  emojiBubble: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  selectedEmoji: {
    backgroundColor: `${colors.white}EE`
  },
  emoji: {
    fontSize: 12,
    lineHeight: 16
  },
  label: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold,
    color: colors.text
  },
  selectedLabel: {
    color: colors.white
  }
});
