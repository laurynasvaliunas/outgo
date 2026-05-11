import { LinearGradient } from "expo-linear-gradient";
import type { ReactNode } from "react";
import { StyleSheet, type StyleProp, type ViewStyle } from "react-native";
import { brandGradients, radii } from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

type GradientSurfaceProps = {
  children?: ReactNode;
  variant?: "brand" | "soft" | "dark" | "sunrise" | "calm";
  style?: StyleProp<ViewStyle>;
};

export function GradientSurface({
  children,
  variant = "soft",
  style
}: GradientSurfaceProps) {
  const { isDark } = useAppTheme();
  const colors =
    variant === "brand"
      ? brandGradients.aurora
      : variant === "dark"
        ? brandGradients.auroraDark
        : variant === "sunrise"
          ? brandGradients.sunrise
          : variant === "calm"
            ? brandGradients.calm
            : isDark
              ? brandGradients.auroraDark
              : brandGradients.auroraSoft;

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.surface, style]}
    >
      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  surface: {
    borderRadius: radii.xl,
    overflow: "hidden"
  }
});
