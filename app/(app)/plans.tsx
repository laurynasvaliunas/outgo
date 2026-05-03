import { useState } from "react";
import { StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EventCard } from "@/components/events/EventCard";
import { useMyEvents } from "@/hooks/useEvents";
import { spacing } from "@/lib/theme";

type PlansTab = "joined" | "hosted";

export default function PlansScreen() {
  const [tab, setTab] = useState<PlansTab>("joined");
  const { joined, hosted, loading, error, refresh } = useMyEvents();
  const events = tab === "joined" ? joined : hosted;

  return (
    <Screen>
      <SectionHeader
        title="My Plans"
        subtitle="The app should get quieter after this. Your offline plans live here."
      />
      <SegmentedControl
        value={tab}
        onChange={setTab}
        options={[
          { label: "Joined", value: "joined" },
          { label: "Hosted", value: "hosted" }
        ]}
      />
      <View style={styles.list}>
        {loading ? <LoadingState message="Loading your plans..." /> : null}
        {error ? (
          <EmptyState title="Could not load plans" message={error} actionTitle="Try again" onAction={refresh} />
        ) : null}
        {!loading && !error && events.length === 0 ? (
          <EmptyState
            title={tab === "joined" ? "No joined plans yet" : "No hosted plans yet"}
            message={
              tab === "joined"
                ? "Join a coffee, walk or study plan and it will appear here."
                : "Host a small public plan with clear expectations."
            }
            actionTitle={tab === "joined" ? "Browse events" : "Create event"}
            onAction={() => router.push(tab === "joined" ? "/events" : "/create-event")}
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
      <Button title="Refresh" variant="ghost" onPress={refresh} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: spacing.md
  }
});
