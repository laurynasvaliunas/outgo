import { StyleSheet, Text, View } from "react-native";
import { colors, spacing, typography } from "@/lib/theme";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
};

export function EmptyState({
  title,
  message,
  actionTitle,
  onAction
}: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
      {actionTitle && onAction ? (
        <Button title={actionTitle} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.xxl,
    gap: spacing.md,
    alignItems: "center"
  },
  title: {
    fontSize: typography.subheading,
    fontWeight: "800",
    color: colors.text,
    textAlign: "center"
  },
  message: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: "center",
    lineHeight: 23
  }
});
