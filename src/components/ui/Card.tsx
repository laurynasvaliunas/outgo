import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radii, spacing } from "@/lib/theme";

type CardProps = ViewProps & {
  padded?: boolean;
};

export function Card({ style, padded = true, ...props }: CardProps) {
  return <View style={[styles.card, padded && styles.padded, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: colors.shadow,
    shadowOpacity: 0.05,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2
  },
  padded: {
    padding: spacing.lg
  }
});
