import { Pressable, StyleSheet, Text, View } from "react-native";
import { format, parseISO } from "date-fns";
import { CalendarDays, MapPin, ShieldCheck, Users } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Card } from "@/components/ui/Card";
import { CategoryArtwork } from "@/components/events/CategoryArtwork";
import { categoryMeta, priceLabels } from "@/lib/categories";
import { formatEventDate } from "@/lib/date";
import {
  fontFamilies,
  radii,
  spacing,
  textStyles
} from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { haptic } from "@/lib/haptics";
import type { EventWithMeta } from "@/types/domain";

type EventCardProps = {
  event: EventWithMeta;
  onPress?: () => void;
  compact?: boolean;
};

export function EventCard({ event, onPress, compact }: EventCardProps) {
  const { colors, shadows } = useAppTheme();
  const isFull = event.participant_count >= event.max_participants;
  const meta = categoryMeta[event.category];
  const startDate = parseISO(event.start_time);
  const dayLabel = format(startDate, "EEE");
  const timeLabel = format(startDate, "HH:mm");
  const priceLabel = event.price_amount
    ? `€${event.price_amount}`
    : priceLabels[event.price_type];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${event.title}, ${meta.label}, ${formatEventDate(event.start_time)}, ${event.location_name}`}
      accessibilityHint="Opens the plan details."
      onPress={() => {
        haptic("light");
        onPress?.();
      }}
    >
      {({ pressed }) => (
        <Card padded={false} style={[styles.card, { borderColor: colors.border, ...shadows.soft }, compact && styles.compactCard, pressed && styles.pressed]}>
          <View style={styles.hero}>
            <CategoryArtwork
              category={event.category}
              compact={compact}
              label={!compact ? meta.label : undefined}
              style={styles.artwork}
            />
            <View style={[styles.categoryBadge, { backgroundColor: meta.color }]}>
              <Text numberOfLines={1} style={[styles.badgeText, { color: colors.white }]}>{meta.label}</Text>
            </View>
            <View style={[styles.timeBadge, { backgroundColor: `${colors.surface}F3`, borderColor: colors.border }]}>
              <Text style={[styles.timeDay, { color: colors.primary500 }]}>{dayLabel}</Text>
              <Text style={[styles.timeHour, { color: colors.text }]}>{timeLabel}</Text>
            </View>
            <View
              style={[
                styles.priceBadge,
                { backgroundColor: event.price_type === "free" ? colors.success : colors.amber500 }
              ]}
            >
              <Text numberOfLines={1} style={[styles.badgeText, { color: colors.white }]}>{priceLabel}</Text>
            </View>
          </View>

          <View style={[styles.body, compact && styles.compactBody]}>
            <Text numberOfLines={compact ? 2 : 1} style={[styles.title, { color: colors.text }, compact && styles.compactTitle]}>
              {event.title}
            </Text>
            {!compact ? (
              <Text numberOfLines={2} style={[styles.description, { color: colors.textMuted }]}>
                {event.description}
              </Text>
            ) : null}

            <View style={styles.vibeRow}>
              <Text numberOfLines={1} style={[styles.vibe, { color: colors.primary500, backgroundColor: colors.primary50 }]}>
                {event.vibe}
              </Text>
              {!compact ? (
                <View style={[styles.safetyPill, { backgroundColor: colors.successSoft }]}>
                  <ShieldCheck size={13} color={colors.success} />
                  <Text style={[styles.safetyText, { color: colors.success }]}>Public place</Text>
                </View>
              ) : null}
            </View>

            {!compact ? (
              <View style={[styles.promiseRow, { backgroundColor: colors.surfaceMuted }]}>
                <Text style={[styles.promiseText, { color: colors.textMuted }]}>
                  Small group · clear meetup point · no endless feed
                </Text>
              </View>
            ) : null}

            <View style={styles.meta}>
              <View style={styles.metaRow}>
                <CalendarDays size={15} color={colors.primary500} />
                <Text numberOfLines={1} style={[styles.metaText, { color: colors.textMuted }]}>
                  {formatEventDate(event.start_time)}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <MapPin size={15} color={colors.primary500} />
                <Text numberOfLines={1} style={[styles.metaText, { color: colors.textMuted }]}>
                  {event.location_name}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Users size={15} color={colors.primary500} />
                <Text numberOfLines={1} style={[styles.metaText, { color: colors.textMuted }]}>
                  {event.participant_count}/{event.max_participants} joined
                  {isFull ? " · Full" : ""}
                </Text>
              </View>
            </View>

            <View style={[styles.footer, { borderTopColor: colors.border }]}>
              <View style={styles.host}>
                <Avatar
                  size={compact ? 22 : 30}
                  name={event.host?.full_name ?? event.host?.username ?? "Host"}
                  url={event.host?.avatar_url}
                />
                <Text numberOfLines={1} style={[styles.hostText, { color: colors.textMuted }]}>
                  {event.host?.full_name || event.host?.username || "Local host"}
                </Text>
              </View>
              <Text style={[styles.spots, { color: isFull ? colors.danger : colors.success }]}>
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
    overflow: "hidden"
  },
  compactCard: {
    width: 232
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }]
  },
  hero: {
    position: "relative"
  },
  artwork: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
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
  timeBadge: {
    position: "absolute",
    left: spacing.md,
    bottom: spacing.md,
    minWidth: 66,
    borderRadius: radii.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    alignItems: "center"
  },
  timeDay: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    textTransform: "uppercase"
  },
  timeHour: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
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
  promiseRow: {
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  promiseText: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.bold
  },
  badgeText: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold
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
    fontFamily: fontFamilies.extraBold
  },
  compactTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  description: {
    ...textStyles.body
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  safetyText: {
    ...textStyles.tiny
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
    flex: 1
  },
  footer: {
    paddingTop: spacing.sm,
    borderTopWidth: 1,
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
    flex: 1
  },
  spots: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold
  },
  full: {}
});
