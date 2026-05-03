import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDays, MapPin, Users } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryPill } from "./CategoryPill";
import { formatEventDate } from "@/lib/date";
import { priceLabels } from "@/lib/categories";
import { colors, spacing, typography } from "@/lib/theme";
import type { EventWithMeta } from "@/types/domain";

type EventCardProps = {
  event: EventWithMeta;
  onPress?: () => void;
};

export function EventCard({ event, onPress }: EventCardProps) {
  const isFull = event.participant_count >= event.max_participants;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <Card style={[styles.card, pressed && styles.pressed]}>
          <View style={styles.top}>
            <CategoryPill category={event.category} />
            <Text style={[styles.status, isFull && styles.full]}>
              {isFull ? "Full" : `${event.max_participants - event.participant_count} spots`}
            </Text>
          </View>

          <View style={styles.copy}>
            <Text style={styles.title}>{event.title}</Text>
            <Text numberOfLines={2} style={styles.description}>
              {event.description}
            </Text>
          </View>

          <View style={styles.meta}>
            <View style={styles.metaRow}>
              <CalendarDays size={16} color={colors.primaryDark} />
              <Text style={styles.metaText}>{formatEventDate(event.start_time)}</Text>
            </View>
            <View style={styles.metaRow}>
              <MapPin size={16} color={colors.primaryDark} />
              <Text numberOfLines={1} style={styles.metaText}>
                {event.location_name}
              </Text>
            </View>
            <View style={styles.metaRow}>
              <Users size={16} color={colors.primaryDark} />
              <Text style={styles.metaText}>
                {event.participant_count}/{event.max_participants} joined
              </Text>
            </View>
          </View>

          <View style={styles.footer}>
            <View style={styles.host}>
              <Avatar
                size={30}
                name={event.host?.full_name ?? event.host?.username ?? "Host"}
                url={event.host?.avatar_url}
              />
              <Text numberOfLines={1} style={styles.hostText}>
                {event.host?.full_name || event.host?.username || "Local host"}
              </Text>
            </View>
            <Text style={styles.price}>
              {priceLabels[event.price_type]}
              {event.price_amount ? ` · €${event.price_amount}` : ""}
            </Text>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: spacing.md
  },
  pressed: {
    opacity: 0.9
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: spacing.md
  },
  status: {
    color: colors.success,
    fontSize: typography.small,
    fontWeight: "800"
  },
  full: {
    color: colors.danger
  },
  copy: {
    gap: spacing.xs
  },
  title: {
    color: colors.text,
    fontSize: typography.subheading,
    fontWeight: "900",
    letterSpacing: 0
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 22
  },
  meta: {
    gap: spacing.sm
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  metaText: {
    flex: 1,
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "600"
  },
  footer: {
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  host: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  hostText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "700"
  },
  price: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: typography.small
  }
});
