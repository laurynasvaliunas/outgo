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
  UserPlus,
  UserX
} from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SuccessToast } from "@/components/ui/SuccessToast";
import { CategoryPill } from "@/components/events/CategoryPill";
import { CategoryArtwork } from "@/components/events/CategoryArtwork";
import { PlanTimeline } from "@/components/events/PlanTimeline";
import { TrustPanel } from "@/components/events/TrustPanel";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvents";
import { useThemeColors } from "@/hooks/useAppTheme";
import {
  favoriteEvent,
  joinEvent,
  leaveEvent,
  unfavoriteEvent
} from "@/services/supabase/events";
import { formatEventDate, relativeEventTime } from "@/lib/date";
import { categoryMeta, priceLabels } from "@/lib/categories";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { track } from "@/lib/analytics";
import { haptic } from "@/lib/haptics";

export default function EventDetailsScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { event, loading, error, refresh } = useEvent(id);
  const [joining, setJoining] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [favoriting, setFavoriting] = useState(false);
  const [justJoined, setJustJoined] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const isHost = Boolean(user?.id && event?.host_id === user.id);
  const canChat = Boolean(event?.is_joined || isHost);
  const isFull = event ? event.participant_count >= event.max_participants : false;
  const canJoin = Boolean(event && !event.is_joined && !isHost && !isFull && event.status === "published");

  const handleJoin = async () => {
    if (!user?.id || !event) {
      return;
    }
    setJoining(true);
    try {
      haptic("light");
      await joinEvent(event.id, user.id);
      track("event_join", { event_id: event.id });
      await refresh();
      setJustJoined(true);
      setToast("You're in");
      haptic("success");
    } catch (joinError) {
      Alert.alert(
        "Could not join",
        joinError instanceof Error ? joinError.message : "Please try another event."
      );
    } finally {
      setJoining(false);
    }
  };

  const handleLeave = async () => {
    if (!user?.id || !event) {
      return;
    }
    setLeaving(true);
    try {
      haptic("light");
      await leaveEvent(event.id, user.id);
      track("event_leave", { event_id: event.id });
      await refresh();
      setJustJoined(false);
    } catch (leaveError) {
      Alert.alert(
        "Could not leave",
        leaveError instanceof Error ? leaveError.message : "Please try again."
      );
    } finally {
      setLeaving(false);
    }
  };

  const toggleFavorite = async () => {
    if (!user?.id || !event) {
      return;
    }
    setFavoriting(true);
    try {
      haptic("select");
      if (event.is_favorited) {
        await unfavoriteEvent(event.id, user.id);
      } else {
        await favoriteEvent(event.id, user.id);
      }
      track(event.is_favorited ? "event_unfavorite" : "event_favorite", {
        event_id: event.id
      });
      await refresh();
      setToast(event.is_favorited ? "Removed from saved" : "Plan saved");
    } catch (favoriteError) {
      Alert.alert(
        "Could not update favorite",
        favoriteError instanceof Error ? favoriteError.message : "Please try again."
      );
    } finally {
      setFavoriting(false);
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

  const meta = categoryMeta[event.category];

  return (
    <Screen
      bottomContent={
        <StickyActions
          canJoin={canJoin}
          canChat={canChat}
          isFull={isFull}
          isHost={isHost}
          isJoined={Boolean(event.is_joined)}
          isFavorited={Boolean(event.is_favorited)}
          joining={joining}
          leaving={leaving}
          favoriting={favoriting}
          onJoin={handleJoin}
          onLeave={handleLeave}
          onFavorite={toggleFavorite}
          onChat={() => router.push(`/event/${event.id}/chat`)}
        />
      }
    >
      <View style={[styles.hero, { borderColor: colors.border }]}>
        <CategoryArtwork category={event.category} label={meta.label} style={styles.heroArtwork} />
        <View style={styles.heroFloating}>
          <CategoryPill category={event.category} selected />
          <View style={[styles.heroSignal, { backgroundColor: `${colors.surface}EF`, borderColor: colors.border }]}>
            <MapPin size={15} color={colors.primary500} />
            <Text numberOfLines={1} style={[styles.heroSignalText, { color: colors.text }]}>
              {event.city} · public place
            </Text>
          </View>
        </View>
      </View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{event.title}</Text>
        <Text style={[styles.description, { color: colors.textMuted }]}>{event.description}</Text>
        <View style={styles.headerPills}>
          <Text style={[styles.vibePill, { color: colors.lavender, backgroundColor: colors.lavenderSoft }]}>{event.vibe}</Text>
          <Text style={[styles.statusPill, { color: colors.success, backgroundColor: colors.successSoft }]}>
            {event.participant_count}/{event.max_participants} joined
          </Text>
        </View>
      </View>

      <Card style={styles.metaCard}>
        <View style={[styles.intentStrip, { backgroundColor: colors.primarySofter }]}>
          <Text style={[styles.intentText, { color: colors.text }]}>
            Come for the plan, stay only if it feels right. Small group, clear time, public meetup.
          </Text>
        </View>
        <View style={styles.metaRow}>
          <CalendarDays size={19} color={colors.primaryDark} />
          <View style={styles.metaCopy}>
            <Text style={[styles.metaLine, { color: colors.text }]}>{formatEventDate(event.start_time)}</Text>
            <Text style={[styles.metaMuted, { color: colors.textMuted }]}>{relativeEventTime(event.start_time)}</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <MapPin size={19} color={colors.primaryDark} />
          <View style={styles.metaCopy}>
            <Text style={[styles.metaLine, { color: colors.text }]}>{event.location_name}</Text>
            <Text style={[styles.metaMuted, { color: colors.textMuted }]}>{event.city} · public meetup spot</Text>
          </View>
        </View>
        <View style={styles.metaRow}>
          <UserPlus size={19} color={colors.primaryDark} />
          <View style={styles.metaCopy}>
            <Text style={[styles.metaLine, { color: colors.text }]}>
              {priceLabels[event.price_type]}
              {event.price_amount ? ` · €${event.price_amount}` : ""}
            </Text>
            <Text style={[styles.metaMuted, { color: colors.textMuted }]}>
              Limited group: max {event.max_participants} people
            </Text>
          </View>
        </View>
      </Card>

      {toast ? (
        <SuccessToast
          title={toast}
          message={toast === "You're in" ? "Chat is open for simple plan logistics." : undefined}
        />
      ) : null}

      <Card style={styles.hostCard}>
        <Avatar
          size={50}
          name={event.host?.full_name ?? event.host?.username ?? "Host"}
          url={event.host?.avatar_url}
        />
        <View style={styles.hostCopy}>
          <Text style={[styles.hostLabel, { color: colors.textMuted }]}>Hosted by</Text>
          <Text style={[styles.hostName, { color: colors.text }]}>
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

      {event.participants && event.participants.length > 0 ? (
        <Card style={styles.participantsCard}>
          <View style={styles.participantsCopy}>
            <Text style={[styles.safetyTitle, { color: colors.text }]}>Who is joining</Text>
            <Text style={[styles.safetyText, { color: colors.textMuted }]}>
              {event.participant_count}/{event.max_participants} spots filled
            </Text>
          </View>
          <View style={styles.avatarStack}>
            {event.participants.map((participant, index) => (
              <View
                key={participant.id}
                style={[
                  styles.avatarWrap,
                  {
                    marginLeft: index === 0 ? 0 : -spacing.sm,
                    borderColor: colors.surface
                  }
                ]}
              >
                <Avatar
                  size={34}
                  name={participant.full_name || participant.username}
                  url={participant.avatar_url}
                />
              </View>
            ))}
          </View>
        </Card>
      ) : null}

      {justJoined && event.is_joined ? (
        <Card style={[styles.joinedCard, { backgroundColor: colors.successSoft }]}>
          <MessageCircle size={23} color={colors.success} />
          <View style={styles.safetyCopy}>
            <Text style={[styles.safetyTitle, { color: colors.text }]}>You joined this plan</Text>
            <Text style={[styles.safetyText, { color: colors.text }]}>
              Chat is open now for meeting point details, ETA and friendly logistics.
            </Text>
          </View>
          <Button
            title="Chat"
            onPress={() => router.push(`/event/${event.id}/chat`)}
            style={styles.joinedChatButton}
          />
        </Card>
      ) : null}

      <TrustPanel
        title="Safety note"
        message={
          event.safety_note ||
          "Meet in a public place, tell someone where you are going and leave any time."
        }
      />

      <PlanTimeline />

      <Button
        title="Report event"
        variant="ghost"
        icon={<Flag size={18} color={colors.danger} />}
        onPress={() => router.push(`/report?targetType=event&eventId=${event.id}`)}
      />
    </Screen>
  );
}

function StickyActions({
  canJoin,
  canChat,
  isFull,
  isHost,
  isJoined,
  isFavorited,
  joining,
  leaving,
  favoriting,
  onJoin,
  onLeave,
  onFavorite,
  onChat
}: {
  canJoin: boolean;
  canChat: boolean;
  isFull: boolean;
  isHost: boolean;
  isJoined: boolean;
  isFavorited: boolean;
  joining: boolean;
  leaving: boolean;
  favoriting: boolean;
  onJoin: () => void;
  onLeave: () => void;
  onFavorite: () => void;
  onChat: () => void;
}) {
  const colors = useThemeColors();

  return (
    <View style={[styles.stickyActions, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
      <View style={styles.primaryActionRow}>
        {canJoin ? (
          <Button
            title="Join event"
            loading={joining}
            icon={<UserPlus size={18} color="#FFFFFF" />}
            onPress={onJoin}
            style={styles.primaryAction}
          />
        ) : null}
        {isJoined || isHost ? (
          <Button
            title="Open chat"
            icon={<MessageCircle size={18} color="#FFFFFF" />}
            onPress={onChat}
            style={styles.primaryAction}
          />
        ) : null}
        {!canJoin && !isJoined && !isHost && isFull ? (
          <Button title="Event is full" disabled style={styles.primaryAction} />
        ) : null}
        {!canJoin && !isJoined && !isHost && !isFull ? (
          <Button title="Unavailable" disabled style={styles.primaryAction} />
        ) : null}
        <Button
          title={isFavorited ? "Saved" : "Save"}
          variant="secondary"
          loading={favoriting}
          icon={
            isFavorited ? (
              <HeartOff size={18} color={colors.primaryDark} />
            ) : (
              <Heart size={18} color={colors.primaryDark} />
            )
          }
          onPress={onFavorite}
          style={styles.saveAction}
        />
      </View>
      {isJoined ? (
        <Button
          title="Leave event"
          variant="ghost"
          loading={leaving}
          icon={<UserX size={18} color={colors.primary500} />}
          onPress={onLeave}
          style={styles.leaveAction}
        />
      ) : null}
      {isHost ? (
        <Text style={[styles.hostingNote, { color: colors.textMuted }]}>You are hosting this plan.</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.md
  },
  hero: {
    borderRadius: radii.xl,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    borderWidth: 1,
    overflow: "hidden",
    position: "relative"
  },
  heroArtwork: {
    width: "100%",
    minHeight: 210,
    borderRadius: 0
  },
  heroFloating: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  heroSignal: {
    flex: 1,
    minHeight: 38,
    borderRadius: radii.pill,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.md
  },
  heroSignalText: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold,
    flex: 1
  },
  title: {
    ...textStyles.title
  },
  description: {
    ...textStyles.body
  },
  headerPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm
  },
  vibePill: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden"
  },
  statusPill: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    overflow: "hidden"
  },
  metaCard: {
    gap: spacing.md
  },
  intentStrip: {
    borderRadius: radii.lg,
    padding: spacing.md
  },
  intentText: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
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
    ...textStyles.body,
    fontFamily: fontFamilies.bold
  },
  metaMuted: {
    ...textStyles.small
  },
  hostCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  participantsCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  participantsCopy: {
    flex: 1,
    gap: spacing.xs
  },
  avatarStack: {
    flexDirection: "row",
    alignItems: "center"
  },
  avatarWrap: {
    borderRadius: radii.pill,
    borderWidth: 2
  },
  hostCopy: {
    flex: 1,
    gap: spacing.xs
  },
  hostLabel: {
    ...textStyles.small
  },
  hostName: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  reportButton: {
    minHeight: 38,
    paddingHorizontal: spacing.sm
  },
  joinedCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md
  },
  joinedChatButton: {
    minHeight: 42,
    paddingHorizontal: spacing.md
  },
  safetyCopy: {
    flex: 1,
    gap: spacing.xs
  },
  safetyTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  safetyText: {
    ...textStyles.small
  },
  stickyActions: {
    borderTopWidth: 1,
    gap: spacing.sm
  },
  primaryActionRow: {
    flexDirection: "row",
    gap: spacing.sm
  },
  primaryAction: {
    flex: 1
  },
  saveAction: {
    minWidth: 112,
    paddingHorizontal: spacing.md
  },
  leaveAction: {
    minHeight: 40
  },
  hostingNote: {
    ...textStyles.small,
    textAlign: "center"
  }
});
