import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { colors, radii, spacing, typography } from "@/lib/theme";
import { Button } from "./Button";

type EmptyStateProps = {
  title: string;
  message: string;
  actionTitle?: string;
  onAction?: () => void;
  icon?: ReactNode;
};

export function EmptyState({
  title,
  message,
  actionTitle,
  onAction,
  icon
}: EmptyStateProps) {
  return (
    <View style={styles.wrapper}>
      {icon ? <View style={styles.icon}>{icon}</View> : null}
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
  icon: {
    width: 58,
    height: 58,
    borderRadius: radii.pill,
    backgroundColor: colors.primarySofter,
    alignItems: "center",
    justifyContent: "center"
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
