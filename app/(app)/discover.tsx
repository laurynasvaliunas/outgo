import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Map, Plus, ShieldCheck } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { EventCard } from "@/components/events/EventCard";
import { EventFilters } from "@/components/events/EventFilters";
import { useEvents } from "@/hooks/useEvents";
import { colors, fontFamilies, spacing, textStyles } from "@/lib/theme";
import type { EventFilters as Filters } from "@/types/domain";

export default function DiscoverScreen() {
  const [filters, setFilters] = useState<Filters>({ date: "week", category: "all" });
  const { events, loading, error, refresh } = useEvents(filters);
  const featuredEvents = useMemo(() => events.slice(0, 5), [events]);

  return (
    <Screen
      contentStyle={styles.content}
      scroll
    >
      <SectionHeader
        title="Discover"
        subtitle="Small, calm plans nearby and around the world."
        right={
          <Button
            title="Create"
            icon={<Plus size={18} color="#FFFFFF" />}
            onPress={() => router.push("/create-event")}
            style={styles.createButton}
          />
        }
      />

      <Card style={styles.positioning}>
        <Text style={styles.positioningTitle}>Less feed. More fresh air.</Text>
        <Text style={styles.positioningText}>
          OutGo keeps plans bounded: limited group size, public places,
          simple chat and no infinite social graph.
        </Text>
      </Card>

      <EventFilters filters={filters} onChange={setFilters} compact />

      <View style={styles.actions}>
        <Button
          title="Open map"
          variant="secondary"
          icon={<Map size={18} color={colors.primaryDark} />}
          onPress={() => router.push("/map")}
          style={styles.action}
        />
        <Button
          title="All events"
          variant="secondary"
          onPress={() => router.push("/events")}
          style={styles.action}
        />
      </View>

      <View style={styles.list}>
        <SectionHeader title="Happening soon" />
        {loading ? <LoadingState message="Loading real-world plans..." /> : null}
        {error ? (
          <EmptyState title="Could not load events" message={error} actionTitle="Try again" onAction={refresh} />
        ) : null}
        {!loading && !error && featuredEvents.length === 0 ? (
          <EmptyState
            title="No plans match yet"
            message="Try another category or create the first calm meetup for your neighborhood."
            actionTitle="Create event"
            onAction={() => router.push("/create-event")}
          />
        ) : null}
        {featuredEvents.map((event) => (
          <EventCard
            key={event.id}
            event={event}
            onPress={() => router.push(`/event/${event.id}`)}
          />
        ))}
      </View>

      <Card style={styles.safety}>
        <ShieldCheck size={22} color={colors.success} />
        <View style={styles.safetyCopy}>
          <Text style={styles.safetyTitle}>A good first meetup is public.</Text>
          <Text style={styles.safetyText}>
            Hosts are asked to choose public places, describe expectations and
            keep groups intentionally small.
          </Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingBottom: 96
  },
  createButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  positioning: {
    gap: spacing.sm,
    backgroundColor: colors.primary900
  },
  positioningTitle: {
    ...textStyles.heading,
    fontFamily: fontFamilies.extraBold,
    color: colors.surface,
  },
  positioningText: {
    ...textStyles.body,
    color: colors.primarySoft,
  },
  actions: {
    flexDirection: "row",
    gap: spacing.md
  },
  action: {
    flex: 1
  },
  list: {
    gap: spacing.md
  },
  safety: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.surface
  },
  safetyCopy: {
    flex: 1,
    gap: spacing.xs
  },
  safetyTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  safetyText: {
    ...textStyles.small,
    color: colors.textMuted,
  }
});
