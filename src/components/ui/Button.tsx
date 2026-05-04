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
import { colors, fontFamilies, radii, shadows, spacing, textStyles } from "@/lib/theme";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "amber" | "outline";

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
  const filled = variant === "primary" || variant === "danger" || variant === "amber";
  const indicatorColor = filled ? colors.white : colors.primary500;
  const textStyle =
    variant === "primary"
      ? styles.primaryText
      : variant === "secondary"
        ? styles.secondaryText
        : variant === "outline"
          ? styles.outlineText
          : variant === "danger"
            ? styles.dangerText
            : variant === "amber"
              ? styles.amberText
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
        <ActivityIndicator color={indicatorColor} />
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
    minHeight: 50,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.lg,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: spacing.sm
  },
  primary: {
    backgroundColor: colors.primary500,
    ...shadows.pin
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.soft
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.borderStrong
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.danger,
    ...shadows.soft
  },
  amber: {
    backgroundColor: colors.amber500,
    ...shadows.soft
  },
  disabled: {
    opacity: 0.55
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.99 }]
  },
  text: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  primaryText: {
    color: colors.white
  },
  secondaryText: {
    color: colors.primary700
  },
  outlineText: {
    color: colors.primary700
  },
  ghostText: {
    color: colors.primary500
  },
  dangerText: {
    color: colors.white
  },
  amberText: {
    color: colors.white
  }
});
