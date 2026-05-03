import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import {
  CalendarDays,
  Flag,
  Heart,
  HeartOff,
  MapPin,
  MessageCircle,
  ShieldCheck,
  UserPlus,
  UserX
} from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { CategoryPill } from "@/components/events/CategoryPill";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvents";
import {
  favoriteEvent,
  joinEvent,
  leaveEvent,
  unfavoriteEvent
} from "@/services/supabase/events";
import { formatEventDate, relativeEventTime } from "@/lib/date";
import { priceLabels } from "@/lib/categories";
import { colors, spacing, typography } from "@/lib/theme";
import { track } from "@/lib/analytics";

export default function EventDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { event, loading, error, refresh } = useEvent(id);
  const [busy, setBusy] = useState(false);

  const isHost = Boolean(user?.id && event?.host_id === user.id);
  const canChat = Boolean(event?.is_joined || isHost);
  const isFull = event ? event.participant_count >= event.max_participants : false;
  const canJoin = Boolean(event && !event.is_joined && !isHost && !isFull && event.status === "published");

  const handleJoin = async () => {
    if (!user?.id || !event) {
      return;
    }
    setBusy(true);
    try {
      await joinEvent(event.id, user.id);
      track("event_join", { event_id: event.id });
      await refresh();
    } catch (joinError) {
      Alert.alert(
        "Could not join",
        joinError instanceof Error ? joinError.message : "Please try another event."
      );
    } finally {
      setBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!user?.id || !event) {
      return;
    }
    setBusy(true);
    try {
      await leaveEvent(event.id, user.id);
      track("event_leave", { event_id: event.id });
      await refresh();
    } catch (leaveError) {
      Alert.alert(
        "Could not leave",
        leaveError instanceof Error ? leaveError.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user?.id || !event) {
      return;
    }
    setBusy(true);
    try {
      if (event.is_favorited) {
        await unfavoriteEvent(event.id, user.id);
      } else {
        await favoriteEvent(event.id, user.id);
      }
      track(event.is_favorited ? "event_unfavorite" : "event_favorite", {
        event_id: event.id
      });
      await refresh();
    } catch (favoriteError) {
      Alert.alert(
        "Could not update favorite",
        favoriteError instanceof Error ? favoriteError.message : "Please try again."
      );
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <Screen centered>
        <LoadingState message="Opening event..." />
      </Screen>
    );
  }

  if (error || !event) {
    return (
      <Screen>
        <EmptyState
          title="Event unavailable"
          message={error ?? "This event may have been removed."}
          actionTitle="Back to discover"
          onAction={() => router.replace("/map")}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <CategoryPill category={event.category} />
        <Text style={styles.title}>{event.title}</Text>
        <Text style={styles.description}>{event.description}</Text>
        <View style={styles.headerPills}>
          <Text style={styles.vibePill}>{event.vibe}</Text>
          <Text style={styles.statusPill}>
            {event.participant_count}/{event.max_participants} joined
          </Text>
        </View>
      </View>

      <Card style={styles.metaCard}>
        <View style={styles.metaRow}>
          <CalendarDays size={19} color={colors.primaryDark} />
          <View style={styles.metaCopy}>
            <Text style={styles.metaLine}>{formatEventDate(event.start_time)}</Text>
            <Text style={styles.metaMuted}>{relativeEventTime(event.start_time)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <MapPin size={19} color={colors.primaryDark} />
          <View style={styles.metaCopy}>
            <Text style={styles.metaLine}>{event.location_name}</Text>
            <Text style={styles.metaMuted}>{event.city} · public meetup spot</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <UserPlus size={19} color={colors.primaryDark} />
          <View style={styles.metaCopy}>
            <Text style={styles.metaLine}>
              {priceLabels[event.price_type]}
              {event.price_amount ? ` · €${event.price_amount}` : ""}
            </Text>
            <Text style={styles.metaMuted}>
              Limited group: max {event.max_participants} people
            </Text>
          </View>
        </View>
      </Card>

      <Card style={styles.hostCard}>
        <Avatar
          size={50}
          name={event.host?.full_name ?? event.host?.username ?? "Host"}
          url={event.host?.avatar_url}
        />
        <View style={styles.hostCopy}>
          <Text style={styles.hostLabel}>Hosted by</Text>
          <Text style={styles.hostName}>
            {event.host?.full_name || event.host?.username || "Local host"}
          </Text>
        </View>
        {event.host_id !== user?.id ? (
          <Button
            title="Report"
            variant="ghost"
            icon={<Flag size={17} color={colors.danger} />}
            onPress={() => router.push(`/report?targetType=user&userId=${event.host_id}`)}
            style={styles.reportButton}
          />
        ) : null}
      </Card>

      <Card style={styles.safetyCard}>
        <ShieldCheck size={24} color={colors.success} />
        <View style={styles.safetyCopy}>
          <Text style={styles.safetyTitle}>Safety note</Text>
          <Text style={styles.safetyText}>
            {event.safety_note ||
              "Meet in a public place, tell someone where you are going and leave any time."}
          </Text>
        </View>
      </Card>

      <Card style={styles.afterJoinCard}>
        <MessageCircle size={23} color={colors.blue} />
        <View style={styles.safetyCopy}>
          <Text style={styles.safetyTitle}>After joining</Text>
          <Text style={styles.safetyText}>
            Participant chat opens for simple logistics: meeting point, ETA and
            friendly basics. No public popularity mechanics.
          </Text>
        </View>
      </Card>

      <View style={styles.actions}>
        {canJoin ? (
          <Button
            title="Join event"
            loading={busy}
            icon={<UserPlus size={18} color="#FFFFFF" />}
            onPress={handleJoin}
          />
        ) : null}
        {event.is_joined ? (
          <Button
            title="Leave event"
            variant="secondary"
            loading={busy}
            icon={<UserX size={18} color={colors.primaryDark} />}
            onPress={handleLeave}
          />
        ) : null}
        {isHost ? <Button title="You are hosting" disabled /> : null}
        {!canJoin && !event.is_joined && !isHost && isFull ? (
          <Button title="Event is full" disabled />
        ) : null}
        <Button
          title={event.is_favorited ? "Saved" : "Save"}
          variant="secondary"
          loading={busy}
          icon={
            event.is_favorited ? (
              <HeartOff size={18} color={colors.primaryDark} />
            ) : (
              <Heart size={18} color={colors.primaryDark} />
            )
          }
          onPress={toggleFavorite}
        />
        {canChat ? (
          <Button
            title="Open event chat"
            icon={<MessageCircle size={18} color="#FFFFFF" />}
            onPress={() => router.push(`/event/${event.id}/chat`)}
          />
        ) : null}
        <Button
          title="Report event"
          variant="ghost"
          icon={<Flag size={18} color={colors.danger} />}
          onPress={() => router.push(`/report?targetType=event&eventId=${event.id}`)}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md
  },
  title: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: "900",
    letterSpacing: 0
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 24
  },
  headerPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  vibePill: {
    color: colors.lavender,
    backgroundColor: colors.lavenderSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.small,
    fontWeight: "900",
    overflow: "hidden"
  },
  statusPill: {
    color: colors.success,
    backgroundColor: colors.successSoft,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    fontSize: typography.small,
    fontWeight: "900",
    overflow: "hidden"
  },
  metaCard: {
    gap: spacing.md
  },
  metaRow: {
    flexDirection: "row",
    gap: spacing.md,
    alignItems: "flex-start"
  },
  metaCopy: {
    flex: 1,
    gap: spacing.xs
  },
  metaLine: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "800"
  },
  metaMuted: {
    color: colors.textMuted,
    fontSize: typography.small
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  hostCopy: {
    flex: 1,
    gap: spacing.xs
  },
  hostLabel: {
    color: colors.textMuted,
    fontSize: typography.small,
    fontWeight: "700"
  },
  hostName: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  reportButton: {
    minHeight: 38,
    paddingHorizontal: spacing.sm
  },
  safetyCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.primarySofter
  },
  afterJoinCard: {
    flexDirection: "row",
    gap: spacing.md,
    backgroundColor: colors.blueSoft
  },
  safetyCopy: {
    flex: 1,
    gap: spacing.xs
  },
  safetyTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  safetyText: {
    color: colors.text,
    fontSize: typography.small,
    lineHeight: 19
  },
  actions: {
    gap: spacing.md
  }
});
