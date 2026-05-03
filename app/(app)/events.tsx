import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { useEvents } from "@/hooks/useEvents";
import { spacing } from "@/lib/theme";
import type { EventFilters as Filters } from "@/types/domain";

export default function EventsScreen() {
  const [filters, setFilters] = useState<Filters>({
    category: "all",
    date: "all",
    priceType: "all"
  });
  const { events, loading, error, refresh } = useEvents(filters);

  return (
    <Screen>
      <SectionHeader
        title="Event List"
        subtitle="Browse without the feed spiral. Pick a plan, then put the phone away."
      />
      <EventFilters filters={filters} onChange={setFilters} />

      <View style={styles.list}>
        {loading ? <LoadingState message="Loading events..." /> : null}
        {error ? (
          <EmptyState title="Could not load events" message={error} actionTitle="Try again" onAction={refresh} />
        ) : null}
        {!loading && !error && events.length === 0 ? (
          <EmptyState
            title="Nothing here yet"
            message="Clear a filter or host a small plan others can join."
            actionTitle="Create event"
            onAction={() => router.push("/create-event")}
          />
        ) : null}
        {events.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => router.push(`/event/${event.id}`)}
          />
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md
  }
});
