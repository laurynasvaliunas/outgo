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
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

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
  const { colors, shadows } = useAppTheme();
  const isDisabled = disabled || loading;
  const filled = variant === "primary" || variant === "danger" || variant === "amber";
  const indicatorColor = filled ? colors.white : colors.primary500;
  const textStyle = {
    color:
      variant === "primary" || variant === "danger" || variant === "amber"
        ? colors.white
        : variant === "ghost"
          ? colors.primary500
          : colors.primary700
  };
  const variantStyle =
    variant === "primary"
      ? { backgroundColor: colors.primary500, ...shadows.pin }
      : variant === "secondary"
        ? {
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
            ...shadows.soft
          }
        : variant === "outline"
          ? {
              backgroundColor: "transparent",
              borderWidth: 1.5,
              borderColor: colors.borderStrong
            }
          : variant === "danger"
            ? { backgroundColor: colors.danger, ...shadows.soft }
            : variant === "amber"
              ? { backgroundColor: colors.amber500, ...shadows.soft }
              : { backgroundColor: "transparent" };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyle,
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
  },
  secondary: {
  },
  outline: {
  },
  ghost: {
  },
  danger: {
  },
  amber: {
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
  primaryText: {},
  secondaryText: {},
  outlineText: {},
  ghostText: {},
  dangerText: {},
  amberText: {}
});
