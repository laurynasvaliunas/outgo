import { CheckCircle2 } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

type SuccessToastProps = {
  title: string;
  message?: string;
};

export function SuccessToast({ title, message }: SuccessToastProps) {
  const colors = useThemeColors();

  return (
    <View style={[styles.toast, { backgroundColor: colors.successSoft, borderColor: `${colors.success}55` }]}>
      <CheckCircle2 size={20} color={colors.success} />
      <View style={styles.copy}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
        {message ? <Text style={[styles.message, { color: colors.textMuted }]}>{message}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    borderRadius: radii.xl,
    borderWidth: 1,
    padding: spacing.md,
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "center"
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  message: {
    ...textStyles.tiny
  }
});
