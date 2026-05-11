import { ShieldCheck } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

type TrustPanelProps = {
  title?: string;
  message: string;
};

export function TrustPanel({ title = "Low-pressure by design", message }: TrustPanelProps) {
  const colors = useThemeColors();

  return (
    <Card style={[styles.panel, { backgroundColor: colors.primarySofter }]}>
      <ShieldCheck size={24} color={colors.success} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  panel: {
    flexDirection: "row",
    gap: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  message: {
    ...textStyles.small
  }
});
