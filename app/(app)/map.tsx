import { useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { MapPin, Plus } from "lucide-react-native";
import { EventMap } from "@/components/maps/EventMap";
import { EventFilters } from "@/components/events/EventFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { Button } from "@/components/ui/Button";
import { useDeviceOrigin, useEvents } from "@/hooks/useEvents";
import { GLOBAL_MAP_CENTER } from "@/lib/distance";
import { colors, fontFamilies, radii, shadows, spacing, textStyles } from "@/lib/theme";
import type { EventFilters as EventFilterState } from "@/types/domain";

const MAP_FILTERS: EventFilterState = {
  date: "week"
};

export default function MapScreen() {
  const [filters, setFilters] = useState<EventFilterState>(MAP_FILTERS);
  const origin = useDeviceOrigin();
  const { events, loading, error, refresh } = useEvents(filters);
  const center = origin ?? GLOBAL_MAP_CENTER;
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
      <View style={styles.mapFrame}>
        {!loading && !error ? (
          <EventMap
            events={events}
            center={center}
            hasDeviceOrigin={Boolean(origin)}
            onEventPress={(event) => router.push(`/event/${event.id}`)}
          />
        ) : (
          <View style={styles.mapFallback} />
        )}

        <View style={styles.topPanel}>
          <View style={styles.topRow}>
            <View style={styles.locationPill}>
              <MapPin size={15} color={colors.primary500} />
              <Text numberOfLines={1} style={styles.locationText}>
                {origin ? "Near you" : "Worldwide"}
              </Text>
              <Text numberOfLines={1} style={styles.locationSubtext}>
                · Today → +7 days
              </Text>
            </View>
            <Button
              title="Host"
              icon={<Plus size={17} color={colors.white} />}
              onPress={() => router.push("/create-event")}
              style={styles.hostButton}
            />
          </View>
          <EventFilters filters={filters} onChange={setFilters} compact />
        </View>

        {loading ? (
          <View style={styles.centerOverlay}>
            <LoadingState message="Loading this week's plans..." />
          </View>
        ) : null}

        {error ? (
          <View style={styles.centerOverlay}>
            <EmptyState
              title="Could not load map"
              message={error}
              actionTitle="Try again"
              onAction={refresh}
            />
          </View>
        ) : null}

        {!loading && !error ? (
          <View style={styles.summaryPill}>
            <Text style={styles.summaryText}>{eventCountLabel} this week</Text>
          </View>
        ) : null}

        {!loading && !error && events.length === 0 ? (
          <View style={styles.mapEmpty}>
            <Text style={styles.mapEmptyTitle}>No plans this week</Text>
            <Text style={styles.mapEmptyText}>Create the first low-pressure meetup around a public place.</Text>
          </View>
        ) : null}

        {!loading && !error && events.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.eventRailContent}
            style={styles.eventRail}
          >
            {events.map((event) => (
              <View key={event.id} style={styles.previewWrap}>
                <EventCard
                  event={event}
                  compact
                  onPress={() => router.push(`/event/${event.id}`)}
                />
              </View>
            ))}
          </ScrollView>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    padding: 0,
    gap: 0
  },
  mapFrame: {
    flex: 1,
    overflow: "hidden",
    backgroundColor: colors.surfaceMuted
  },
  mapFallback: {
    flex: 1,
    backgroundColor: colors.surfaceMuted
  },
  topPanel: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    right: spacing.lg,
    gap: spacing.md
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  locationPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.pill,
    backgroundColor: `${colors.white}EE`,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.ml,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    ...shadows.soft
  },
  locationText: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  locationSubtext: {
    ...textStyles.tiny,
    color: colors.textMuted,
    flexShrink: 1
  },
  hostButton: {
    minHeight: 44,
    paddingHorizontal: spacing.md
  },
  centerOverlay: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    top: "34%",
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md
  },
  summaryPill: {
    position: "absolute",
    top: 142,
    left: spacing.lg,
    maxWidth: "76%",
    borderRadius: radii.pill,
    backgroundColor: `${colors.white}EE`,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    ...shadows.soft
  },
  summaryText: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  mapEmpty: {
    position: "absolute",
    left: spacing.lg,
    right: spacing.lg,
    bottom: spacing.lg,
    backgroundColor: `${colors.surface}F2`,
    borderRadius: radii.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.xs,
    ...shadows.medium
  },
  mapEmptyTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  mapEmptyText: {
    ...textStyles.small,
    color: colors.textMuted,
  },
  eventRail: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0
  },
  eventRailContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.md
  },
  previewWrap: {
    paddingVertical: spacing.xs
  }
});
