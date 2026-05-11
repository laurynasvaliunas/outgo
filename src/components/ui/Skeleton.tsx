import { useEffect } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming
} from "react-native-reanimated";
import { radii, spacing } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

type SkeletonProps = {
  style?: StyleProp<ViewStyle>;
};

export function Skeleton({ style }: SkeletonProps) {
  const colors = useThemeColors();
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(1, { duration: 900 }), -1, true);
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value
  }));

  return (
    <Animated.View
      style={[styles.base, { backgroundColor: colors.surfaceMuted }, animatedStyle, style]}
    />
  );
}

export function EventCardSkeleton() {
  return (
    <View style={styles.card}>
      <Skeleton style={styles.hero} />
      <Skeleton style={styles.lineLarge} />
      <Skeleton style={styles.lineMedium} />
      <Skeleton style={styles.lineSmall} />
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg
  },
  card: {
    gap: spacing.md
  },
  hero: {
    height: 128,
    borderRadius: radii.xl
  },
  lineLarge: {
    height: 22,
    width: "82%"
  },
  lineMedium: {
    height: 16,
    width: "62%"
  },
  lineSmall: {
    height: 14,
    width: "44%"
  }
});
