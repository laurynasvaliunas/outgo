import { StyleSheet, View, type ViewProps } from "react-native";
import { colors, radii, shadows, spacing } from "@/lib/theme";

type CardProps = ViewProps & {
  padded?: boolean;
};

export function Card({ style, padded = true, ...props }: CardProps) {
  return <View style={[styles.card, padded && styles.padded, style]} {...props} />;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft
  },
  padded: {
    padding: spacing.lg
  }
});
