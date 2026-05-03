import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { useMyEvents } from "@/hooks/useEvents";
import { spacing } from "@/lib/theme";

export default function JoinedEventsScreen() {
  const { joined, loading, error, refresh } = useMyEvents();

  return (
    <Screen>
      <SectionHeader title="Joined Events" subtitle="Plans you said yes to." />
      <View style={styles.list}>
        {loading ? <LoadingState message="Loading joined events..." /> : null}
        {error ? (
          <EmptyState title="Could not load joined events" message={error} actionTitle="Try again" onAction={refresh} />
        ) : null}
        {!loading && !error && joined.length === 0 ? (
          <EmptyState
            title="No joined events"
            message="Find a small plan that feels easy to attend."
            actionTitle="Browse events"
            onAction={() => router.push("/events")}
          />
        ) : null}
        {joined.map((event) => (
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
