import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  type PressableProps,
  type StyleProp,
  type ViewStyle
} from "react-native";
import type { ReactNode } from "react";
import { colors, radii, spacing, typography } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PressableProps & {
  title: string;
  variant?: ButtonVariant;
  loading?: boolean;
  icon?: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Button({
  title,
  variant = "primary",
  loading,
  icon,
  style,
  disabled,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const textStyle =
    variant === "primary"
      ? styles.primaryText
      : variant === "secondary"
        ? styles.secondaryText
        : variant === "danger"
          ? styles.dangerText
          : styles.ghostText;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style
      ]}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? "#FFFFFF" : colors.primary}
        />
      ) : (
        <>
          {icon}
          <Text
            numberOfLines={1}
            adjustsFontSizeToFit
            style={[styles.text, textStyle]}
          >
            {title}
          </Text>
        </>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  primary: {
    backgroundColor: colors.primary
  },
  secondary: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: colors.primary
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.82
  },
  text: {
    fontSize: typography.body,
    fontWeight: "700",
    letterSpacing: 0
  },
  primaryText: {
    color: "#FFFFFF"
  },
  secondaryText: {
    color: colors.primaryDark
  },
  ghostText: {
    color: colors.primaryDark
  },
  dangerText: {
    color: "#FFFFFF"
  }
});
