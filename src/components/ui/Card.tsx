import { StyleSheet, View, type ViewProps } from "react-native";
import { radii, spacing } from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

type CardProps = ViewProps & {
  padded?: boolean;
};

export function Card({ style, padded = true, ...props }: CardProps) {
  const { colors, shadows } = useAppTheme();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.surface,
          borderColor: colors.border,
          ...shadows.soft
        },
        padded && styles.padded,
        style
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    borderWidth: 1
  },
  padded: {
    padding: spacing.lg
  }
});
