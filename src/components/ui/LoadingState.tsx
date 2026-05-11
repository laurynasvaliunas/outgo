import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { BrandMark } from "@/components/brand/BrandMark";
import { spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  const colors = useThemeColors();

  return (
    <View style={styles.wrapper}>
      <BrandMark size="sm" />
      <ActivityIndicator color={colors.primary} />
      <Text style={[styles.text, { color: colors.textMuted }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.huge,
    gap: spacing.md,
    alignItems: "center",
    justifyContent: "center"
  },
  text: {
    ...textStyles.small
  }
});
