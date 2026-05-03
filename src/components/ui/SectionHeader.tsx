import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { colors, spacing, typography } from "@/lib/theme";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  right?: ReactNode;
};

export function SectionHeader({ title, subtitle, right }: SectionHeaderProps) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: typography.heading,
    fontWeight: "900",
    letterSpacing: 0
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 20,
    fontWeight: "700"
  }
});
