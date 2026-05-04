import { Pressable, StyleSheet, Text, View } from "react-native";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { categoryMeta, priceLabels } from "@/lib/categories";
import { formatEventDate } from "@/lib/date";
import {
  colors,
  fontFamilies,
  radii,
  shadows,
  spacing,
  textStyles
} from "@/lib/theme";
import type { EventWithMeta } from "@/types/domain";

type EventCardProps = {
  event: EventWithMeta;
  onPress?: () => void;
  compact?: boolean;
};

export function EventCard({ event, onPress, compact }: EventCardProps) {
  const isFull = event.participant_count >= event.max_participants;
  const meta = categoryMeta[event.category];
  const priceLabel = event.price_amount
    ? `€${event.price_amount}`
    : priceLabels[event.price_type];

  return (
    <Pressable accessibilityRole="button" onPress={onPress}>
      {({ pressed }) => (
        <Card padded={false} style={[styles.card, compact && styles.compactCard, pressed && styles.pressed]}>
          <View style={[styles.hero, compact && styles.compactHero, { backgroundColor: `${meta.color}1F` }]}>
            <Text style={[styles.heroEmoji, compact && styles.compactHeroEmoji]}>{meta.emoji}</Text>
            <View style={[styles.categoryBadge, { backgroundColor: meta.color }]}>
              <Text numberOfLines={1} style={styles.badgeText}>{meta.label}</Text>
            </View>
            <View
              style={[
                styles.priceBadge,
                { backgroundColor: event.price_type === "free" ? colors.success : colors.amber500 }
              ]}
            >
              <Text numberOfLines={1} style={styles.badgeText}>{priceLabel}</Text>
            </View>
          </View>

          <View style={[styles.body, compact && styles.compactBody]}>
            <Text numberOfLines={compact ? 2 : 1} style={[styles.title, compact && styles.compactTitle]}>
              {event.title}
            </Text>
            {!compact ? (
              <Text numberOfLines={2} style={styles.description}>
                {event.description}
              </Text>
            ) : null}

            <View style={styles.vibeRow}>
              <Text numberOfLines={1} style={styles.vibe}>
                {event.vibe}
              </Text>
              {!compact ? (
                <View style={styles.safetyPill}>
                  <ShieldCheck size={13} color={colors.success} />
                  <Text style={styles.safetyText}>Public place</Text>
                </View>
              ) : null}
            </View>

            <View style={styles.meta}>
              <View style={styles.metaRow}>
                <CalendarDays size={15} color={colors.primary500} />
                <Text numberOfLines={1} style={styles.metaText}>
                  {formatEventDate(event.start_time)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin size={15} color={colors.primary500} />
                <Text numberOfLines={1} style={styles.metaText}>
                  {event.location_name}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Users size={15} color={colors.primary500} />
                <Text numberOfLines={1} style={styles.metaText}>
                  {event.participant_count}/{event.max_participants} joined
                  {isFull ? " · Full" : ""}
                </Text>
              </View>
            </View>

            <View style={styles.footer}>
              <View style={styles.host}>
                <Avatar
                  size={compact ? 22 : 30}
                  name={event.host?.full_name ?? event.host?.username ?? "Host"}
                  url={event.host?.avatar_url}
                />
                <Text numberOfLines={1} style={styles.hostText}>
                  {event.host?.full_name || event.host?.username || "Local host"}
                </Text>
              </View>
              <Text style={[styles.spots, isFull && styles.full]}>
                {isFull ? "Full" : `${event.max_participants - event.participant_count} spots`}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden",
    borderColor: colors.border,
    ...shadows.soft
  },
  compactCard: {
    width: 232
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }]
  },
  hero: {
    minHeight: 128,
    alignItems: "center",
    justifyContent: "center",
    position: "relative"
  },
  compactHero: {
    minHeight: 92
  },
  heroEmoji: {
    fontSize: 48,
    lineHeight: 58
  },
  compactHeroEmoji: {
    fontSize: 36,
    lineHeight: 44
  },
  categoryBadge: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    maxWidth: 140,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  priceBadge: {
    position: "absolute",
    top: spacing.md,
    right: spacing.md,
    maxWidth: 82,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  badgeText: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    color: colors.white
  },
  body: {
    padding: spacing.lg,
    gap: spacing.md
  },
  compactBody: {
    padding: spacing.md,
    gap: spacing.sm
  },
  title: {
    ...textStyles.md,
    fontFamily: fontFamilies.extraBold,
    color: colors.text
  },
  compactTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    color: colors.text
  },
  description: {
    ...textStyles.body,
    color: colors.textMuted
  },
  vibeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: spacing.sm
  },
  vibe: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    color: colors.primary500,
    backgroundColor: colors.primary50,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden"
  },
  safetyPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    borderRadius: radii.pill,
    backgroundColor: colors.successSoft,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  safetyText: {
    ...textStyles.tiny,
    color: colors.success
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
    ...textStyles.small,
    flex: 1,
    color: colors.textMuted
  },
  footer: {
    paddingTop: spacing.sm,
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
    ...textStyles.small,
    flex: 1,
    color: colors.textMuted
  },
  spots: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    color: colors.success
  },
  full: {
    color: colors.danger
  }
});
