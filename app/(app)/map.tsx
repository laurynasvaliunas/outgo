import { useEffect, useMemo, useState } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MapPin } from "lucide-react-native";
import { EventMap } from "@/components/maps/EventMap";
import { EventFilters } from "@/components/events/EventFilters";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { PlanBottomSheet } from "@/components/events/PlanBottomSheet";
import { useEvents } from "@/hooks/useEvents";
import { useAppTheme } from "@/hooks/useAppTheme";
import { GLOBAL_MAP_CENTER } from "@/lib/distance";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import type { EventFilters as EventFilterState } from "@/types/domain";

const MAP_FILTERS: EventFilterState = {
  date: "week"
};

export default function MapScreen() {
  const { colors, shadows } = useAppTheme();
  const insets = useSafeAreaInsets();
  const [filters, setFilters] = useState<EventFilterState>(MAP_FILTERS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [sheetExpanded, setSheetExpanded] = useState(true);
  const { events, loading, error, refresh, origin } = useEvents(filters);
  const center = origin ?? GLOBAL_MAP_CENTER;
  const topPanelTop = spacing.lg + Math.max(insets.top * 0.15, 0);
  const selectedEvent = useMemo(
    () => events.find((event) => event.id === selectedEventId) ?? events[0] ?? null,
    [events, selectedEventId]
  );

  useEffect(() => {
    if (events.length === 0) {
      setSelectedEventId(null);
      return;
    }
    if (!selectedEventId || !events.some((event) => event.id === selectedEventId)) {
      setSelectedEventId(events[0].id);
    }
  }, [events, selectedEventId]);

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
      <View style={[styles.mapFrame, { backgroundColor: colors.surfaceMuted }]}>
        {!loading && !error ? (
          <EventMap
            events={events}
            center={center}
            hasDeviceOrigin={Boolean(origin)}
            compassTopInset={topPanelTop + 126}
            selectedEventId={selectedEvent?.id}
            onEventPress={(event) => {
              setSelectedEventId(event.id);
              setSheetExpanded(false);
            }}
          />
        ) : (
          <View style={[styles.mapFallback, { backgroundColor: colors.surfaceMuted }]} />
        )}

        <View style={[styles.topPanel, { top: topPanelTop }]}>
          <View style={[styles.topRow, { backgroundColor: `${colors.surface}EE`, borderColor: colors.border, ...shadows.soft }]}>
            <View style={[styles.locationPill, { backgroundColor: `${colors.surface}EE`, borderColor: colors.border, ...shadows.soft }]}>
              <MapPin size={15} color={colors.primary500} />
              <Text numberOfLines={1} style={[styles.locationText, { color: colors.text }]}>
                {origin ? "Near you" : "Worldwide"}
              </Text>
              <Text numberOfLines={1} style={[styles.locationSubtext, { color: colors.textMuted }]}>
                · Today → +7 days
              </Text>
            </View>
          </View>
          <EventFilters filters={filters} onChange={setFilters} compact />
        </View>

        <PlanBottomSheet
          events={events}
          loading={loading}
          error={error}
          filters={filters}
          onFiltersChange={setFilters}
          onEventPress={(event) => router.push(`/event/${event.id}`)}
          onCreatePress={() => router.push("/create-event")}
          onRetry={refresh}
          bottomInset={Math.max(insets.bottom, spacing.sm)}
          selectedEvent={selectedEvent}
          expanded={sheetExpanded}
          onExpandedChange={setSheetExpanded}
        />
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
    overflow: "hidden"
  },
  mapFallback: {
    flex: 1
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
    gap: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    padding: spacing.xs
  },
  locationPill: {
    flex: 1,
    minHeight: 44,
    borderRadius: radii.pill,
    borderWidth: 0,
    paddingHorizontal: spacing.ml,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs
  },
  locationText: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  locationSubtext: {
    ...textStyles.tiny,
    flexShrink: 1
  },
  summaryText: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  }
});
