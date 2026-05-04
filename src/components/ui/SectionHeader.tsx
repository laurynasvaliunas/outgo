import { StyleSheet, Text, View } from "react-native";
import type { ReactNode } from "react";
import { colors, fontFamilies, spacing, textStyles } from "@/lib/theme";

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
    ...textStyles.heading,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  subtitle: {
    ...textStyles.small,
    color: colors.textMuted,
    fontFamily: fontFamilies.medium
  }
});
