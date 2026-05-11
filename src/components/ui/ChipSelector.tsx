import { Pressable, StyleSheet, Text, View } from "react-native";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

type ChipSelectorProps = {
  label: string;
  options: string[];
  values: string[];
  onChange: (values: string[]) => void;
  max?: number;
};

export function ChipSelector({
  label,
  options,
  values,
  onChange,
  max = 12
}: ChipSelectorProps) {
  const colors = useThemeColors();

  const toggle = (option: string) => {
    if (values.includes(option)) {
      onChange(values.filter((value) => value !== option));
      return;
    }

    if (values.length < max) {
      onChange([...values, option]);
    }
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.labelRow}>
        <Text style={[styles.label, { color: colors.textMuted }]}>{label}</Text>
        <Text style={[styles.count, { color: colors.textSubtle }]}>
          {values.length}/{max}
        </Text>
      </View>
      <View style={styles.chips}>
        {options.map((option) => {
          const selected = values.includes(option);
          return (
            <Pressable
              accessibilityRole="button"
              key={option}
              onPress={() => toggle(option)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? colors.primary500 : colors.surface,
                  borderColor: selected ? colors.primary500 : colors.border
                }
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  { color: selected ? colors.white : colors.text }
                ]}
              >
                {option}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm
  },
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  label: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  },
  count: {
    ...textStyles.tiny
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  chip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  chipText: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  }
});
