import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import Animated, { FadeIn, FadeOut } from "react-native-reanimated";
import { BrandMark } from "@/components/brand/BrandMark";
import { GradientSurface } from "@/components/ui/GradientSurface";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";
import { haptic } from "@/lib/haptics";

const slides = [
  {
    eyebrow: "Nearby",
    title: "Real plans.\nReal people.",
    subtitle: "Open OutGo and see small offline plans around you this week.",
    scene: "map"
  },
  {
    eyebrow: "Small",
    title: "Safe, small,\nand local.",
    subtitle: "Public places, limited groups, clear expectations and easy reporting.",
    scene: "group"
  },
  {
    eyebrow: "Phone-light",
    title: "Less phone.\nMore life.",
    subtitle: "Join, coordinate, then put the screen away when real life starts.",
    scene: "offline"
  }
];

export default function OnboardingScreen() {
  const colors = useThemeColors();
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex];
  const lastSlide = slideIndex === slides.length - 1;

  return (
    <Screen centered contentStyle={styles.screen}>
      <View style={styles.hero}>
        <GradientSurface variant="soft" style={[styles.brandStage, { borderColor: colors.border }]}>
          <BrandMark size="lg" />
          <StoryScene scene={slide.scene} />
          <Text style={[styles.eyebrow, { color: colors.primary500 }]}>{slide.eyebrow}</Text>
        </GradientSurface>
        <Animated.View
          key={slide.title}
          entering={FadeIn.duration(220)}
          exiting={FadeOut.duration(140)}
          style={styles.copy}
        >
          <Text style={[styles.title, { color: colors.text }]}>{slide.title}</Text>
          <Text style={[styles.subtitle, { color: colors.textMuted }]}>{slide.subtitle}</Text>
        </Animated.View>
        <View style={styles.dots}>
          {slides.map((item, index) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              onPress={() => {
                haptic("select");
                setSlideIndex(index);
              }}
              style={[
                styles.dot,
                { backgroundColor: colors.border },
                index === slideIndex && [styles.dotActive, { backgroundColor: colors.primary500 }]
              ]}
            />
          ))}
        </View>
      </View>

      <View style={styles.actions}>
        {lastSlide ? (
          <Link href="/register" asChild>
            <Button title="Get started - it's free" />
          </Link>
        ) : (
          <Button
            title="Continue"
            onPress={() => {
              haptic("select");
              setSlideIndex((current) => current + 1);
            }}
          />
        )}
        <Link href="/login" asChild>
          <Button title={lastSlide ? "Sign in" : "I already have an account"} variant="ghost" />
        </Link>
      </View>

      <View style={styles.legal}>
        <Text style={[styles.legalText, { color: colors.textSubtle }]}>By continuing you agree to our</Text>
        <View style={styles.legalLinks}>
          <Link href="/legal/terms" asChild>
            <Text style={[styles.legalLink, { color: colors.primary500 }]}>Terms</Text>
          </Link>
          <Text style={[styles.legalText, { color: colors.textSubtle }]}>and</Text>
          <Link href="/legal/privacy" asChild>
            <Text style={[styles.legalLink, { color: colors.primary500 }]}>Privacy Policy</Text>
          </Link>
        </View>
      </View>
    </Screen>
  );
}

function StoryScene({ scene }: { scene: string }) {
  const colors = useThemeColors();

  return (
    <View style={styles.storyScene}>
      <View style={[styles.sceneCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.sceneLine, { backgroundColor: colors.primary100, width: scene === "map" ? "72%" : "48%" }]} />
        <View style={[styles.sceneLine, { backgroundColor: colors.accentSoft, width: scene === "group" ? "82%" : "58%" }]} />
        <View style={styles.sceneDots}>
          <View style={[styles.sceneDot, { backgroundColor: colors.primary500 }]} />
          <View style={[styles.sceneDot, { backgroundColor: colors.accent }]} />
          <View style={[styles.sceneDot, { backgroundColor: colors.success }]} />
        </View>
      </View>
      <View style={[styles.sceneBadge, { backgroundColor: colors.primary500 }]}>
        <Text style={[styles.sceneBadgeText, { color: colors.white }]}>
          {scene === "map" ? "Tonight" : scene === "group" ? "6 spots" : "Join real life"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    justifyContent: "space-between",
    paddingBottom: spacing.xxxl
  },
  hero: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.lg
  },
  brandStage: {
    width: "100%",
    minHeight: 238,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xxxl
  },
  storyScene: {
    width: "100%",
    alignItems: "center",
    gap: spacing.sm
  },
  sceneCard: {
    width: "82%",
    minHeight: 74,
    borderRadius: 24,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.sm
  },
  sceneLine: {
    height: 9,
    borderRadius: radii.pill
  },
  sceneDots: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  sceneDot: {
    width: 14,
    height: 14,
    borderRadius: radii.pill
  },
  sceneBadge: {
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  sceneBadgeText: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold
  },
  eyebrow: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    textTransform: "uppercase",
    letterSpacing: 1
  },
  copy: {
    alignItems: "center",
    gap: spacing.md
  },
  title: {
    ...textStyles.title,
    textAlign: "center"
  },
  subtitle: {
    ...textStyles.body,
    textAlign: "center",
    maxWidth: 290
  },
  dots: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.xs
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: radii.pill,
    backgroundColor: undefined
  },
  dotActive: {
    width: 24
  },
  actions: {
    gap: spacing.sm,
    alignSelf: "stretch"
  },
  legal: {
    gap: spacing.xs,
    alignItems: "center"
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  legalText: {
    ...textStyles.tiny,
    textAlign: "center"
  },
  legalLink: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.bold,
    textDecorationLine: "underline"
  }
});
