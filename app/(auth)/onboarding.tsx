import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { colors, fontFamilies, spacing, textStyles } from "@/lib/theme";

const slides = [
  {
    emoji: "🌍",
    title: "Real plans.\nReal people.",
    subtitle: "Discover small, low-pressure social activities happening near you this week."
  },
  {
    emoji: "🤝",
    title: "Safe, small,\nand local.",
    subtitle: "Every plan is public-place oriented, small-group, and hosted with clear expectations."
  },
  {
    emoji: "📵",
    title: "Less phone.\nMore life.",
    subtitle: "OutGo is built to help you go outside, meet people, and put the screen away."
  }
];

export default function OnboardingScreen() {
  const [slideIndex, setSlideIndex] = useState(0);
  const slide = slides[slideIndex];
  const lastSlide = slideIndex === slides.length - 1;

  return (
    <Screen centered contentStyle={styles.screen}>
      <View style={styles.hero}>
        <Text style={styles.emoji}>{slide.emoji}</Text>
        <Text style={styles.title}>{slide.title}</Text>
        <Text style={styles.subtitle}>{slide.subtitle}</Text>
        <View style={styles.dots}>
          {slides.map((item, index) => (
            <Pressable
              key={item.title}
              accessibilityRole="button"
              onPress={() => setSlideIndex(index)}
              style={[styles.dot, index === slideIndex && styles.dotActive]}
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
          <Button title="Continue" onPress={() => setSlideIndex((current) => current + 1)} />
        )}
        <Link href="/login" asChild>
          <Button title={lastSlide ? "Sign in" : "I already have an account"} variant="ghost" />
        </Link>
      </View>

      <View style={styles.legal}>
        <Text style={styles.legalText}>By continuing you agree to our</Text>
        <View style={styles.legalLinks}>
          <Link href="/legal/terms" asChild>
            <Text style={styles.legalLink}>Terms</Text>
          </Link>
          <Text style={styles.legalText}>and</Text>
          <Link href="/legal/privacy" asChild>
            <Text style={styles.legalLink}>Privacy Policy</Text>
          </Link>
        </View>
      </View>
    </Screen>
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
  emoji: {
    fontSize: 72,
    lineHeight: 84
  },
  title: {
    ...textStyles.title,
    color: colors.text,
    textAlign: "center"
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textMuted,
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
    borderRadius: 4,
    backgroundColor: colors.border
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary500
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
    color: colors.textSubtle,
    textAlign: "center"
  },
  legalLink: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.bold,
    color: colors.primary500,
    textDecorationLine: "underline"
  }
});
