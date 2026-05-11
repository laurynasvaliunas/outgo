import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withDelay,
  withSequence,
  withTiming
} from "react-native-reanimated";
import { useAppTheme } from "@/hooks/useAppTheme";
import { fontFamilies, radii, spacing, typography } from "@/lib/theme";

const logoSource = require("../../../assets/images/icon.png");
let hasShownIntroThisLaunch = false;

export function IntroAnimationOverlay() {
  const [isVisible, setIsVisible] = useState(!hasShownIntroThisLaunch);
  const reducedMotion = useReducedMotion();
  const { colors, shadows } = useAppTheme();

  const overlayOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(0);
  const logoScale = useSharedValue(reducedMotion ? 1 : 0.88);
  const logoTranslateY = useSharedValue(reducedMotion ? 0 : 10);
  const sentenceOpacity = useSharedValue(0);
  const sentenceTranslateY = useSharedValue(reducedMotion ? 0 : 10);
  const ringOpacity = useSharedValue(0);
  const ringScale = useSharedValue(0.78);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    hasShownIntroThisLaunch = true;

    const finish = () => {
      setIsVisible(false);
    };

    if (reducedMotion) {
      contentOpacity.value = withTiming(1, { duration: 120 });
      sentenceOpacity.value = withDelay(80, withTiming(1, { duration: 120 }));
      overlayOpacity.value = withDelay(
        900,
        withTiming(0, { duration: 180 }, (finished) => {
          if (finished) {
            runOnJS(finish)();
          }
        })
      );
      return;
    }

    contentOpacity.value = withTiming(1, {
      duration: 280,
      easing: Easing.out(Easing.cubic)
    });
    logoScale.value = withSequence(
      withTiming(1.04, { duration: 360, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 220, easing: Easing.out(Easing.quad) })
    );
    logoTranslateY.value = withTiming(0, {
      duration: 360,
      easing: Easing.out(Easing.cubic)
    });
    sentenceOpacity.value = withDelay(
      260,
      withTiming(1, { duration: 280, easing: Easing.out(Easing.cubic) })
    );
    sentenceTranslateY.value = withDelay(
      260,
      withTiming(0, { duration: 280, easing: Easing.out(Easing.cubic) })
    );
    ringOpacity.value = withSequence(
      withTiming(0.32, { duration: 260, easing: Easing.out(Easing.quad) }),
      withDelay(260, withTiming(0, { duration: 540, easing: Easing.out(Easing.quad) }))
    );
    ringScale.value = withTiming(1.34, {
      duration: 960,
      easing: Easing.out(Easing.cubic)
    });
    overlayOpacity.value = withDelay(
      1040,
      withTiming(0, { duration: 360, easing: Easing.out(Easing.cubic) }, (finished) => {
        if (finished) {
          runOnJS(finish)();
        }
      })
    );
  }, [
    contentOpacity,
    logoScale,
    logoTranslateY,
    overlayOpacity,
    reducedMotion,
    isVisible,
    ringOpacity,
    ringScale,
    sentenceOpacity,
    sentenceTranslateY
  ]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value
  }));

  const logoStyle = useAnimatedStyle(() => ({
    transform: [
      { translateY: logoTranslateY.value },
      { scale: logoScale.value }
    ]
  }));

  const sentenceStyle = useAnimatedStyle(() => ({
    opacity: sentenceOpacity.value,
    transform: [{ translateY: sentenceTranslateY.value }]
  }));

  const ringStyle = useAnimatedStyle(() => ({
    opacity: ringOpacity.value,
    transform: [{ scale: ringScale.value }]
  }));

  if (!isVisible) {
    return null;
  }

  return (
    <Animated.View
      pointerEvents="auto"
      style={[
        styles.overlay,
        { backgroundColor: colors.background },
        overlayStyle
      ]}
    >
      <Animated.View style={[styles.content, contentStyle]}>
        <View style={styles.logoStage}>
          <Animated.View
            style={[
              styles.logoRing,
              { borderColor: colors.primary300, backgroundColor: colors.primarySoft },
              ringStyle
            ]}
          />
          <Animated.View
            style={[
              styles.logoFrame,
              {
                backgroundColor: colors.backgroundElevated,
                borderColor: colors.border
              },
              shadows.large,
              logoStyle
            ]}
          >
            <Image source={logoSource} style={styles.logo} resizeMode="cover" />
          </Animated.View>
        </View>
        <Animated.View style={[styles.copyBlock, sentenceStyle]}>
          <Text style={[styles.sentence, { color: colors.text }]}>Join real life.</Text>
          <View style={[styles.accentLine, { backgroundColor: colors.accent }]} />
        </Animated.View>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    elevation: 999,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
    zIndex: 999
  },
  content: {
    alignItems: "center",
    justifyContent: "center"
  },
  logoStage: {
    alignItems: "center",
    height: 178,
    justifyContent: "center",
    width: 178
  },
  logoRing: {
    borderRadius: 88,
    borderWidth: 1,
    height: 176,
    position: "absolute",
    width: 176
  },
  logoFrame: {
    alignItems: "center",
    borderRadius: 34,
    borderWidth: 1,
    height: 126,
    justifyContent: "center",
    overflow: "hidden",
    width: 126
  },
  logo: {
    height: 126,
    width: 126
  },
  copyBlock: {
    alignItems: "center",
    gap: spacing.md,
    marginTop: spacing.lg
  },
  sentence: {
    fontFamily: fontFamilies.extraBold,
    fontSize: typography.heading,
    letterSpacing: 0,
    lineHeight: 32,
    textAlign: "center"
  },
  accentLine: {
    borderRadius: radii.pill,
    height: 4,
    width: 54
  }
});
