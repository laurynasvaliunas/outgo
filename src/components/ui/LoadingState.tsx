import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { colors, spacing, textStyles } from "@/lib/theme";

type LoadingStateProps = {
  message?: string;
};

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <View style={styles.wrapper}>
      <ActivityIndicator color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
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
    color: colors.textMuted,
    ...textStyles.small
  }
});
