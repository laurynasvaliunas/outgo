import { Pressable, StyleSheet, Text } from "react-native";
import { categoryLabels, categoryTone } from "@/lib/categories";
import { colors, radii, spacing, typography } from "@/lib/theme";
import type { EventCategory } from "@/types/domain";

type CategoryPillProps = {
  category: EventCategory;
  selected?: boolean;
  onPress?: () => void;
};

export function CategoryPill({ category, selected, onPress }: CategoryPillProps) {
  const tone = categoryTone[category];
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={!onPress}
      style={[
        styles.pill,
        tone === "blue" && styles.blue,
        tone === "clay" && styles.clay,
        selected && styles.selected
      ]}
    >
      <Text style={[styles.label, selected && styles.selectedLabel]}>
        {categoryLabels[category]}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "flex-start",
    borderRadius: radii.pill,
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: "transparent"
  },
  blue: {
    backgroundColor: colors.blueSoft
  },
  clay: {
    backgroundColor: colors.accentSoft
  },
  selected: {
    borderColor: colors.text,
    backgroundColor: colors.text
  },
  label: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "800"
  },
  selectedLabel: {
    color: colors.surface
  }
});
