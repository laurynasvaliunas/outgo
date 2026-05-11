import { useRef, useState } from "react";
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { format } from "date-fns";
import { Flag, Send, ShieldCheck } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientSurface } from "@/components/ui/GradientSurface";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvents";
import { useEventMessages } from "@/hooks/useEventMessages";
import { useThemeColors } from "@/hooks/useAppTheme";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";
import { haptic } from "@/lib/haptics";
import { formatEventDate } from "@/lib/date";
import type { EventMessage } from "@/types/domain";

const quickReplies = ["I'm here", "Running 5 min late", "Where exactly?", "See you soon"];

export default function EventChatScreen() {
  const colors = useThemeColors();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { event, loading: eventLoading } = useEvent(id);
  const { messages, loading, error, send } = useEventMessages(id);
  const listRef = useRef<FlatList<EventMessage>>(null);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const canChat = Boolean(event && user?.id && (event.is_joined || event.host_id === user.id));

  const submit = async () => {
    if (!body.trim()) {
      return;
    }
    setSending(true);
    try {
      haptic("light");
      await send(body);
      setBody("");
      haptic("success");
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    } catch (sendError) {
      Alert.alert(
        "Could not send",
        sendError instanceof Error ? sendError.message : "Please try again."
      );
    } finally {
      setSending(false);
    }
  };

  if (eventLoading || loading) {
    return (
      <Screen centered>
        <LoadingState message="Opening event chat..." />
      </Screen>
    );
  }

  if (!canChat) {
    return (
      <Screen>
        <EmptyState
          title="Join to chat"
          message="Event chat is only visible to joined participants and the host."
          actionTitle="Back to event"
          onAction={() => router.replace(`/event/${id}`)}
        />
      </Screen>
    );
  }

  return (
    <Screen scroll={false} contentStyle={styles.screen}>
      <SectionHeader
        title="Event Chat"
        subtitle={event?.title ?? "Participants only"}
      />
      {event ? (
        <View style={[styles.eventHeader, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.eventHeaderCopy}>
            <Text numberOfLines={1} style={[styles.eventHeaderTitle, { color: colors.text }]}>
              {event.title}
            </Text>
            <Text numberOfLines={1} style={[styles.eventHeaderMeta, { color: colors.textMuted }]}>
              {formatEventDate(event.start_time)} · {event.location_name}
            </Text>
          </View>
        </View>
      ) : null}
      <GradientSurface variant="soft" style={[styles.chatNotice, { borderColor: colors.border }]}>
        <ShieldCheck size={20} color={colors.success} />
        <View style={styles.noticeCopy}>
          <Text style={[styles.noticeTitle, { color: colors.text }]}>Logistics-first chat</Text>
          <Text style={[styles.noticeText, { color: colors.textMuted }]}>
            Keep it practical: meeting point, ETA, group details. Report anything that feels unsafe.
          </Text>
        </View>
        <Button
          title="Report"
          variant="ghost"
          icon={<Flag size={16} color={colors.danger} />}
          onPress={() => router.push(`/report?targetType=event&eventId=${id}`)}
          style={styles.reportButton}
        />
      </GradientSurface>
      {error ? (
        <EmptyState title="Could not load chat" message={error} />
      ) : (
        <FlatList
          ref={listRef}
          style={styles.messagesList}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: false })}
          onLayout={() => listRef.current?.scrollToEnd({ animated: false })}
          ListEmptyComponent={
            <EmptyState
              title="No messages yet"
              message="Use chat for logistics, meeting point details and friendly basics."
            />
          }
          renderItem={({ item }) => {
            const mine = item.sender_id === user?.id;
            return (
              <View style={[styles.messageRow, mine && styles.messageRowMine]}>
                {!mine ? (
                  <Avatar
                    size={34}
                    name={item.sender?.full_name ?? item.sender?.username}
                    url={item.sender?.avatar_url}
                  />
                ) : null}
                <Card
                  style={[
                    styles.message,
                    mine && {
                      backgroundColor: colors.primary500,
                      borderColor: colors.primary500
                    }
                  ]}
                >
                  <Text style={[styles.sender, { color: mine ? colors.primarySoft : colors.textMuted }]}>
                    {mine
                      ? "You"
                      : item.sender?.full_name || item.sender?.username || "Participant"}
                  </Text>
                  <Text style={[styles.messageText, { color: mine ? colors.surface : colors.text }]}>
                    {item.body}
                  </Text>
                  <Text style={[styles.timestamp, { color: mine ? colors.primarySoft : colors.textSubtle }]}>
                    {format(new Date(item.created_at), "HH:mm")}
                  </Text>
                </Card>
              </View>
            );
          }}
        />
      )}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.quickReplies}
      >
        {quickReplies.map((reply) => (
          <Pressable
            key={reply}
            accessibilityRole="button"
            accessibilityLabel={`Insert ${reply}`}
            onPress={() => {
              haptic("select");
              setBody((current) => (current.trim() ? `${current.trim()} ${reply}` : reply));
            }}
            style={({ pressed }) => [
              styles.quickReply,
              { backgroundColor: colors.surface, borderColor: colors.border },
              pressed && styles.quickReplyPressed
            ]}
          >
            <Text style={[styles.quickReplyText, { color: colors.primary500 }]}>{reply}</Text>
          </Pressable>
        ))}
      </ScrollView>
      <View style={[styles.composer, { borderTopColor: colors.border, backgroundColor: colors.background }]}>
        <View style={styles.composerInput}>
          <Input
            label="Message"
            hideLabel
            value={body}
            onChangeText={setBody}
            placeholder="Meeting point, ETA, friendly logistics..."
          />
        </View>
        <Button
          title="Send"
          loading={sending}
          icon={<Send size={18} color="#FFFFFF" />}
          onPress={submit}
          style={styles.sendButton}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1
  },
  messages: {
    gap: spacing.md,
    paddingBottom: spacing.xl
  },
  messagesList: {
    flex: 1
  },
  eventHeader: {
    borderWidth: 1,
    borderRadius: radii.xl,
    padding: spacing.md
  },
  eventHeaderCopy: {
    gap: spacing.xs
  },
  eventHeaderTitle: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  eventHeaderMeta: {
    ...textStyles.small
  },
  chatNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    borderWidth: 1
  },
  noticeCopy: {
    flex: 1,
    gap: spacing.xs
  },
  noticeTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  noticeText: {
    ...textStyles.tiny
  },
  reportButton: {
    minHeight: 36,
    paddingHorizontal: spacing.sm
  },
  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm
  },
  messageRowMine: {
    justifyContent: "flex-end"
  },
  message: {
    maxWidth: "82%",
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: 22
  },
  messageMine: {},
  sender: {
    ...textStyles.tiny
  },
  senderMine: {},
  messageText: {
    ...textStyles.body
  },
  messageTextMine: {},
  quickReplies: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
    paddingRight: spacing.md
  },
  quickReply: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  quickReplyPressed: {
    opacity: 0.82,
    transform: [{ scale: 0.98 }]
  },
  quickReplyText: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  composer: {
    borderTopWidth: 1,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    paddingHorizontal: spacing.xs
  },
  composerInput: {
    flex: 1
  },
  sendButton: {
    minWidth: 76,
    minHeight: 50,
    borderRadius: radii.pill
  },
  timestamp: {
    ...textStyles.tiny,
    alignSelf: "flex-end"
  }
});
