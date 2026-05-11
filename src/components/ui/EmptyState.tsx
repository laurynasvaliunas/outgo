import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { BrandMark } from "@/components/brand/BrandMark";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";
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
  const colors = useThemeColors();

  return (
    <View style={styles.wrapper}>
      {icon ? (
        <View style={[styles.icon, { backgroundColor: colors.primarySofter }]}>{icon}</View>
      ) : (
        <BrandMark size="sm" />
      )}
      <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      {actionTitle && onAction ? (
        <Button title={actionTitle} variant="secondary" onPress={onAction} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    paddingVertical: spacing.huge,
    gap: spacing.md,
    alignItems: "center"
  },
  icon: {
    width: 64,
    height: 64,
    borderRadius: radii.pill,
    alignItems: "center",
    justifyContent: "center"
  },
  title: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.bold,
    textAlign: "center"
  },
  message: {
    ...textStyles.body,
    textAlign: "center",
    maxWidth: 280
  }
});
