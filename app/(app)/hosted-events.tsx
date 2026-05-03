import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { useMyEvents } from "@/hooks/useEvents";
import { spacing } from "@/lib/theme";

export default function HostedEventsScreen() {
  const { hosted, loading, error, refresh } = useMyEvents();

  return (
    <Screen>
      <SectionHeader title="My Hosted Events" subtitle="Plans you created for others." />
      <View style={styles.list}>
        {loading ? <LoadingState message="Loading hosted events..." /> : null}
        {error ? (
          <EmptyState title="Could not load hosted events" message={error} actionTitle="Try again" onAction={refresh} />
        ) : null}
        {!loading && !error && hosted.length === 0 ? (
          <EmptyState
            title="No hosted events"
            message="Create a small public plan with a clear meeting point."
            actionTitle="Create event"
            onAction={() => router.push("/create-event")}
          />
        ) : null}
        {hosted.map((event) => (
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
