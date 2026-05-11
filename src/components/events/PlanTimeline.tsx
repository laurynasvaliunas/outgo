import { CalendarCheck, MapPin, MessageCircle } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

const steps = [
  {
    title: "Join the small group",
    body: "Reserve a spot without public likes or pressure.",
    Icon: CalendarCheck
  },
  {
    title: "Coordinate simply",
    body: "Chat stays focused on place, ETA and friendly basics.",
    Icon: MessageCircle
  },
  {
    title: "Meet in real life",
    body: "Arrive at a clear public place and leave anytime.",
    Icon: MapPin
  }
];

export function PlanTimeline() {
  const colors = useThemeColors();

  return (
    <Card style={styles.card}>
      <Text style={[styles.heading, { color: colors.text }]}>What happens next</Text>
      {steps.map(({ title, body, Icon }, index) => (
        <View key={title} style={styles.step}>
          <View style={[styles.iconWrap, { backgroundColor: colors.primarySofter }]}>
            <Icon size={17} color={colors.primary500} />
          </View>
          <View style={styles.copy}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
            <Text style={[styles.body, { color: colors.textMuted }]}>{body}</Text>
          </View>
          {index < steps.length - 1 ? (
            <View style={[styles.connector, { backgroundColor: colors.border }]} />
          ) : null}
        </View>
      ))}
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md
  },
  heading: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  step: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    position: "relative"
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center"
  },
  connector: {
    position: "absolute",
    left: 16,
    top: 34,
    width: 2,
    height: spacing.md
  },
  copy: {
    flex: 1,
    gap: spacing.xs
  },
  title: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  body: {
    ...textStyles.tiny
  }
});
