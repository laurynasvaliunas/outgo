import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { CalendarDays, ChevronUp, MapPin, Plus, ShieldCheck, Users } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { EventCard } from "@/components/events/EventCard";
import { EventCardSkeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Avatar } from "@/components/ui/Avatar";
import { CategoryArtwork } from "@/components/events/CategoryArtwork";
import { formatEventDate } from "@/lib/date";
import { categoryMeta } from "@/lib/categories";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { useAppTheme } from "@/hooks/useAppTheme";
import { haptic } from "@/lib/haptics";
import type { EventFilters, EventWithMeta } from "@/types/domain";

type DateChoice = {
  label: string;
  value: EventFilters["date"];
};

const dateChoices: DateChoice[] = [
  { label: "Tonight", value: "today" },
  { label: "Tomorrow", value: "tomorrow" },
  { label: "Weekend", value: "weekend" },
  { label: "7 days", value: "week" }
];

type PlanBottomSheetProps = {
  events: EventWithMeta[];
  loading: boolean;
  error: string | null;
  filters: EventFilters;
  onFiltersChange: (filters: EventFilters) => void;
  onEventPress: (event: EventWithMeta) => void;
  onCreatePress: () => void;
  onRetry: () => void;
  bottomInset: number;
  selectedEvent?: EventWithMeta | null;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
};

export function PlanBottomSheet({
  events,
  loading,
  error,
  filters,
  onFiltersChange,
  onEventPress,
  onCreatePress,
  onRetry,
  bottomInset,
  selectedEvent,
  expanded,
  onExpandedChange
}: PlanBottomSheetProps) {
  const { colors, shadows } = useAppTheme();
  const countText = `${events.length} ${events.length === 1 ? "plan" : "plans"}`;

  const setDate = (date: EventFilters["date"]) => {
    haptic("select");
    onFiltersChange({ ...filters, date });
  };

  return (
    <View
      style={[
        styles.sheet,
        {
          backgroundColor: `${colors.background}F6`,
          borderColor: colors.border,
          paddingBottom: spacing.lg + bottomInset,
          ...shadows.large
        }
      ]}
    >
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={expanded ? "Collapse plan sheet" : "Expand plan sheet"}
        onPress={() => {
          haptic("select");
          onExpandedChange(!expanded);
        }}
        style={styles.handleTarget}
      >
        <View style={[styles.handle, { backgroundColor: colors.borderStrong }]} />
      </Pressable>
      <View style={styles.header}>
        <View style={styles.headingCopy}>
          <Text style={[styles.kicker, { color: colors.primary500 }]}>This week outside</Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {selectedEvent ? selectedEvent.title : `${countText} near the map`}
          </Text>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={expanded ? "Collapse plan sheet" : "Expand plan sheet"}
          onPress={() => onExpandedChange(!expanded)}
          style={({ pressed }) => [
            styles.expandButton,
            { backgroundColor: colors.surfaceMuted, borderColor: colors.border },
            pressed && styles.pressed
          ]}
        >
          <ChevronUp
            size={18}
            color={colors.primary500}
            style={!expanded ? styles.chevronCollapsed : undefined}
          />
        </Pressable>
        <Button
          title="Host"
          icon={<Plus size={17} color={colors.white} />}
          onPress={() => {
            haptic("light");
            onCreatePress();
          }}
          style={styles.hostButton}
        />
      </View>

      {selectedEvent ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${selectedEvent.title}`}
          accessibilityHint="Opens the full plan details."
          onPress={() => onEventPress(selectedEvent)}
          style={({ pressed }) => [
            styles.spotlight,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed
          ]}
        >
          <CategoryArtwork
            category={selectedEvent.category}
            compact
            style={styles.spotlightArt}
          />
          <View style={styles.spotlightCopy}>
            <View style={styles.spotlightTop}>
              <Text numberOfLines={1} style={[styles.spotlightTime, { color: colors.primary500 }]}>
                {formatEventDate(selectedEvent.start_time)}
              </Text>
              <Text style={[styles.spotlightSpots, { color: colors.success }]}>
                {selectedEvent.max_participants - selectedEvent.participant_count} spots
              </Text>
            </View>
            <Text numberOfLines={2} style={[styles.spotlightTitle, { color: colors.text }]}>
              {selectedEvent.title}
            </Text>
            <View style={styles.spotlightMeta}>
              <MapPin size={14} color={colors.textMuted} />
              <Text numberOfLines={1} style={[styles.spotlightMetaText, { color: colors.textMuted }]}>
                {selectedEvent.location_name}
              </Text>
            </View>
            <View style={styles.spotlightTrust}>
              <Avatar
                size={22}
                name={selectedEvent.host?.full_name ?? selectedEvent.host?.username ?? "Host"}
                url={selectedEvent.host?.avatar_url}
              />
              <Text numberOfLines={1} style={[styles.spotlightHost, { color: colors.textMuted }]}>
                {selectedEvent.host?.full_name || selectedEvent.host?.username || "Local host"}
              </Text>
              <ShieldCheck size={14} color={colors.success} />
              <Users size={14} color={categoryMeta[selectedEvent.category].color} />
            </View>
          </View>
        </Pressable>
      ) : null}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRail}
      >
        {dateChoices.map((choice) => {
          const selected = (filters.date ?? "week") === choice.value;
          return (
            <Button
              key={choice.label}
              title={choice.label}
              variant={selected ? "primary" : "secondary"}
              icon={selected ? <CalendarDays size={15} color={colors.white} /> : undefined}
              onPress={() => setDate(choice.value)}
              style={styles.dateChip}
            />
          );
        })}
      </ScrollView>

      {loading ? (
        <View style={styles.skeletonRow}>
          <EventCardSkeleton />
          <EventCardSkeleton />
        </View>
      ) : null}

      {error ? (
        <EmptyState
          title="Could not load plans"
          message={error}
          actionTitle="Try again"
          onAction={onRetry}
        />
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <EmptyState
          title="No plans here yet"
          message="Try a wider time window or host the first low-pressure plan."
          actionTitle="Host a plan"
          onAction={onCreatePress}
        />
      ) : null}

      {!loading && !error && expanded && events.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.eventRail}
        >
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              compact
              onPress={() => onEventPress(event)}
            />
          ))}
        </ScrollView>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    borderRadius: 28,
    borderWidth: 1,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    maxHeight: "72%"
  },
  handleTarget: {
    alignSelf: "center",
    minWidth: 72,
    minHeight: 18,
    alignItems: "center",
    justifyContent: "center"
  },
  handle: {
    width: 42,
    height: 4,
    borderRadius: radii.pill,
    alignSelf: "center"
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  headingCopy: {
    flex: 1,
    gap: spacing.xs
  },
  kicker: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    textTransform: "uppercase"
  },
  title: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
  },
  expandButton: {
    width: 38,
    height: 38,
    borderRadius: radii.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  chevronCollapsed: {
    transform: [{ rotate: "180deg" }]
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.99 }]
  },
  hostButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  spotlight: {
    flexDirection: "row",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden"
  },
  spotlightArt: {
    width: 96,
    minHeight: 128,
    borderRadius: 0
  },
  spotlightCopy: {
    flex: 1,
    padding: spacing.md,
    gap: spacing.sm
  },
  spotlightTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  spotlightTime: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold,
    textTransform: "uppercase"
  },
  spotlightSpots: {
    ...textStyles.tiny,
    fontFamily: fontFamilies.extraBold
  },
  spotlightTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  spotlightMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  spotlightMetaText: {
    ...textStyles.small,
    flex: 1
  },
  spotlightTrust: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  spotlightHost: {
    ...textStyles.tiny,
    flex: 1
  },
  dateRail: {
    gap: spacing.sm,
    paddingRight: spacing.md
  },
  dateChip: {
    minHeight: 36,
    paddingHorizontal: spacing.md
  },
  eventRail: {
    gap: spacing.md,
    paddingRight: spacing.md
  },
  skeletonRow: {
    flexDirection: "row",
    gap: spacing.md
  }
});
