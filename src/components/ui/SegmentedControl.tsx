import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing, typography } from "@/lib/theme";

type Option<T extends string> = {
  label: string;
  value: T;
};

type SegmentedControlProps<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.wrapper}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.option, selected && styles.selected]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[styles.label, selected && styles.selectedLabel]}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 44,
    padding: spacing.xs,
    backgroundColor: colors.surfaceMuted,
    borderRadius: radii.md,
    flexDirection: "row",
    gap: spacing.xs
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.sm,
    paddingHorizontal: spacing.sm
  },
  selected: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  label: {
    color: colors.textMuted,
    fontWeight: "700",
    fontSize: typography.small,
    letterSpacing: 0
  },
  selectedLabel: {
    color: colors.text
  }
});
