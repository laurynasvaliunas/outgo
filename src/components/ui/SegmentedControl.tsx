import { Pressable, StyleSheet, Text, View } from "react-native";
import { radii, spacing, textStyles } from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { colors, shadows } = useAppTheme();

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: colors.surfaceMuted, borderColor: colors.border }
      ]}
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            accessibilityRole="button"
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[
              styles.option,
              selected && {
                backgroundColor: colors.surface,
                borderWidth: 1,
                borderColor: colors.border,
                ...shadows.soft
              }
            ]}
          >
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={[
                styles.label,
                { color: selected ? colors.text : colors.textMuted }
              ]}
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
    minHeight: 48,
    padding: spacing.xs,
    borderRadius: radii.pill,
    flexDirection: "row",
    gap: spacing.xs,
    borderWidth: 1
  },
  option: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm
  },
  selected: {
  },
  label: {
    ...textStyles.small
  },
  selectedLabel: {}
});
