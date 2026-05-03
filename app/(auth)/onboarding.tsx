import { StyleSheet, Text, View } from "react-native";
import { Link } from "expo-router";
import { Coffee, MapPin, ShieldCheck } from "lucide-react-native";
import { Screen } from "@/components/ui/Screen";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { colors, spacing, typography } from "@/lib/theme";

export default function OnboardingScreen() {
  return (
    <Screen centered>
      <View style={styles.hero}>
        <View style={styles.mark}>
          <Coffee size={38} color={colors.primaryDark} />
        </View>
        <Text style={styles.title}>OutGo</Text>
        <Text style={styles.subtitle}>
          Small real-world plans for people who want less scrolling and more
          actual life.
        </Text>
      </View>

      <View style={styles.cards}>
        <Card style={styles.promise}>
          <MapPin size={22} color={colors.blue} />
          <View style={styles.promiseCopy}>
            <Text style={styles.promiseTitle}>Local and low-pressure</Text>
            <Text style={styles.promiseText}>
              Coffee, walks, study sessions, games, language exchange and
              phone-light meetups.
            </Text>
          </View>
        </Card>
        <Card style={styles.promise}>
          <ShieldCheck size={22} color={colors.success} />
          <View style={styles.promiseCopy}>
            <Text style={styles.promiseTitle}>Built with safety cues</Text>
            <Text style={styles.promiseText}>
              Limited group sizes, public place reminders, host rules and
              reporting from day one.
            </Text>
          </View>
        </Card>
      </View>

      <View style={styles.actions}>
        <Link href="/register" asChild>
          <Button title="Join OutGo" />
        </Link>
        <Link href="/login" asChild>
          <Button title="I already have an account" variant="secondary" />
        </Link>
      </View>

      <View style={styles.legal}>
        <Link href="/legal/terms" asChild>
          <Text style={styles.legalLink}>Terms</Text>
        </Link>
        <Text style={styles.legalText}>and</Text>
        <Link href="/legal/privacy" asChild>
          <Text style={styles.legalLink}>Privacy</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: spacing.md,
    alignItems: "center"
  },
  mark: {
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.primary
  },
  title: {
    fontSize: typography.title,
    fontWeight: "900",
    color: colors.text,
    letterSpacing: 0
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: typography.body,
    textAlign: "center",
    lineHeight: 24
  },
  cards: {
    gap: spacing.md
  },
  promise: {
    flexDirection: "row",
    gap: spacing.md
  },
  promiseCopy: {
    flex: 1,
    gap: spacing.xs
  },
  promiseTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  promiseText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19
  },
  actions: {
    gap: spacing.md
  },
  legal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  legalText: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "700"
  },
  legalLink: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: "900"
  }
});
