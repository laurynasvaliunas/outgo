import { Image, StyleSheet, Text, View, type StyleProp, type ViewStyle } from "react-native";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";

const logoSource = require("../../../assets/images/icon.png");

type BrandMarkProps = {
  size?: "sm" | "md" | "lg";
  label?: string;
  showWordmark?: boolean;
  style?: StyleProp<ViewStyle>;
};

const sizes = {
  sm: 42,
  md: 70,
  lg: 104
};

export function BrandMark({
  size = "md",
  label = "OutGo",
  showWordmark = false,
  style
}: BrandMarkProps) {
  const { colors, shadows } = useAppTheme();
  const dimension = sizes[size];

  return (
    <View style={[styles.wrapper, style]}>
      <View
        style={[
          styles.logoFrame,
          {
            width: dimension,
            height: dimension,
            borderRadius: size === "lg" ? 28 : size === "md" ? 20 : 14,
            backgroundColor: colors.backgroundElevated,
            borderColor: colors.border,
            ...shadows.soft
          }
        ]}
      >
        <Image source={logoSource} style={{ width: dimension, height: dimension }} resizeMode="cover" />
      </View>
      {showWordmark ? (
        <Text style={[styles.wordmark, { color: colors.text }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    gap: spacing.sm
  },
  logoFrame: {
    borderWidth: 1,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center"
  },
  wordmark: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
  }
});
