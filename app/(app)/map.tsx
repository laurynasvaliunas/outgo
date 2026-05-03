import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { CalendarDays, MapPin, Users } from "lucide-react-native";
import MapView, { Marker } from "react-native-maps";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { useDeviceOrigin, useEvents } from "@/hooks/useEvents";
import { categoryLabels, priceLabels } from "@/lib/categories";
import { formatEventDate } from "@/lib/date";
import { GLOBAL_MAP_CENTER } from "@/lib/distance";
import { colors, radii, spacing, typography } from "@/lib/theme";
import type { EventFilters, EventWithMeta } from "@/types/domain";

const MAP_FILTERS: EventFilters = {
  date: "week"
};

export default function MapScreen() {
  const origin = useDeviceOrigin();
  const { events, loading, error, refresh } = useEvents(MAP_FILTERS);
  const center = origin ?? GLOBAL_MAP_CENTER;
  const delta = origin ? 0.12 : 140;
  const eventCountLabel = `${events.length} ${events.length === 1 ? "plan" : "plans"}`;

  if (Platform.OS === "web") {
    return (
      <Screen>
        <SectionHeader
          title="Happening this week"
          subtitle="Map preview is available on iOS and Android. Here are plans from today through the next 7 days."
        />
        {loading ? <LoadingState message="Loading this week's plans..." /> : null}
        {error ? (
          <EmptyState title="Could not load plans" message={error} actionTitle="Try again" onAction={refresh} />
        ) : null}
        {!loading && !error && events.length === 0 ? (
          <EmptyState
            title="No plans this week"
            message="Create the first low-pressure meetup around a public place."
          />
        ) : null}
        {!loading && !error
          ? events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}`)}
              />
            ))
          : null}
      </Screen>
    );
  }

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <SectionHeader
        title="Happening this week"
        subtitle="Events, clubs, and meetups from today through the next 7 days."
      />
      {loading ? <LoadingState message="Loading this week's plans..." /> : null}
      {error ? (
        <EmptyState title="Could not load map" message={error} actionTitle="Try again" onAction={refresh} />
      ) : null}
      {!loading && !error ? (
        <View style={styles.mapFrame}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: center.latitude,
              longitude: center.longitude,
              latitudeDelta: delta,
              longitudeDelta: delta
            }}
          >
            {events.map((event) => (
              <Marker
                key={event.id}
                coordinate={{
                  latitude: event.latitude,
                  longitude: event.longitude
                }}
                title={event.title}
                description={event.location_name}
                pinColor={colors.primaryDark}
                onCalloutPress={() => router.push(`/event/${event.id}`)}
              />
            ))}
          </MapView>
          <View style={styles.summaryPill}>
            <Text style={styles.summaryText}>{eventCountLabel} · today to 7 days</Text>
          </View>
          {events.length === 0 ? (
            <View style={styles.mapEmpty}>
              <Text style={styles.mapEmptyTitle}>No plans this week</Text>
              <Text style={styles.mapEmptyText}>Create the first low-pressure meetup around a public place.</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.eventRailContent}
              style={styles.eventRail}
            >
              {events.map((event) => (
                <MapEventPreview key={event.id} event={event} />
              ))}
            </ScrollView>
          )}
        </View>
      ) : null}
    </Screen>
  );
}

function MapEventPreview({ event }: { event: EventWithMeta }) {
  const remainingSpots = Math.max(event.max_participants - event.participant_count, 0);
  const spotsLabel = remainingSpots === 0 ? "Full" : `${remainingSpots} spots`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/event/${event.id}`)}
      style={({ pressed }) => [styles.previewCard, pressed && styles.previewPressed]}
    >
      <View style={styles.previewTop}>
        <Text numberOfLines={1} style={styles.previewCategory}>
          {categoryLabels[event.category]}
        </Text>
        <Text style={[styles.previewSpots, remainingSpots === 0 && styles.previewFull]}>
          {spotsLabel}
        </Text>
      </View>
      <Text numberOfLines={2} style={styles.previewTitle}>
        {event.title}
      </Text>
      <View style={styles.previewMeta}>
        <View style={styles.previewMetaRow}>
          <CalendarDays size={15} color={colors.primaryDark} />
          <Text numberOfLines={1} style={styles.previewMetaText}>
            {formatEventDate(event.start_time)}
          </Text>
        </View>
        <View style={styles.previewMetaRow}>
          <MapPin size={15} color={colors.primaryDark} />
          <Text numberOfLines={1} style={styles.previewMetaText}>
            {event.location_name}
          </Text>
        </View>
        <View style={styles.previewMetaRow}>
          <Users size={15} color={colors.primaryDark} />
          <Text numberOfLines={1} style={styles.previewMetaText}>
            {event.participant_count}/{event.max_participants} joined · {priceLabels[event.price_type]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  mapFrame: {
    flex: 1,
    minHeight: 480,
    borderRadius: radii.md,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted
  },
  map: {
    flex: 1
  },
  summaryPill: {
    position: "absolute",
    top: spacing.md,
    left: spacing.md,
    maxWidth: "76%",
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3
  },
  summaryText: {
    color: colors.text,
    fontSize: typography.small,
    fontWeight: "900"
  },
  mapEmpty: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs
  },
  mapEmptyTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  mapEmptyText: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  eventRail: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  },
  eventRailContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    gap: spacing.md
  },
  previewCard: {
    width: 282,
    minHeight: 172,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: colors.shadow,
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4
  },
  previewPressed: {
    opacity: 0.9
  },
  previewTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm
  },
  previewCategory: {
    flexShrink: 1,
    color: colors.primaryDark,
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    fontSize: typography.tiny,
    fontWeight: "900",
    overflow: "hidden"
  },
  previewSpots: {
    color: colors.success,
    fontSize: typography.tiny,
    fontWeight: "900"
  },
  previewFull: {
    color: colors.danger
  },
  previewTitle: {
    color: colors.text,
    fontSize: typography.body,
    lineHeight: 21,
    fontWeight: "900",
    letterSpacing: 0
  },
  previewMeta: {
    gap: spacing.xs
  },
  previewMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  previewMetaText: {
    flex: 1,
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "700"
  }
});
