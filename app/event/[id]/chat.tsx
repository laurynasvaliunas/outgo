import { useState } from "react";
import { Alert, FlatList, StyleSheet, Text, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Flag, Send, ShieldCheck } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useEvent } from "@/hooks/useEvents";
import { useEventMessages } from "@/hooks/useEventMessages";
import { colors, fontFamilies, radii, spacing, textStyles } from "@/lib/theme";

export default function EventChatScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const { event, loading: eventLoading } = useEvent(id);
  const { messages, loading, error, send } = useEventMessages(id);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);

  const canChat = Boolean(event && user?.id && (event.is_joined || event.host_id === user.id));

  const submit = async () => {
    if (!body.trim()) {
      return;
    }
    setSending(true);
    try {
      await send(body);
      setBody("");
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
      <Card style={styles.chatNotice}>
        <ShieldCheck size={20} color={colors.success} />
        <View style={styles.noticeCopy}>
          <Text style={styles.noticeTitle}>Logistics-first chat</Text>
          <Text style={styles.noticeText}>
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
      </Card>
      {error ? (
        <EmptyState title="Could not load chat" message={error} />
      ) : (
        <FlatList
          style={styles.messagesList}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messages}
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
                <Card style={[styles.message, mine && styles.messageMine]}>
                  <Text style={[styles.sender, mine && styles.senderMine]}>
                    {mine
                      ? "You"
                      : item.sender?.full_name || item.sender?.username || "Participant"}
                  </Text>
                  <Text style={[styles.messageText, mine && styles.messageTextMine]}>
                    {item.body}
                  </Text>
                </Card>
              </View>
            );
          }}
        />
      )}
      <View style={styles.composer}>
        <View style={styles.composerInput}>
          <Input
            label="Message"
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
    paddingBottom: spacing.lg
  },
  messagesList: {
    flex: 1
  },
  chatNotice: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    backgroundColor: colors.primary50,
    padding: spacing.md
  },
  noticeCopy: {
    flex: 1,
    gap: spacing.xs
  },
  noticeTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  noticeText: {
    ...textStyles.tiny,
    color: colors.textMuted,
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
    padding: spacing.md
  },
  messageMine: {
    backgroundColor: colors.primary500,
    borderColor: colors.primary500
  },
  sender: {
    ...textStyles.tiny,
    color: colors.textMuted,
  },
  senderMine: {
    color: colors.primarySoft
  },
  messageText: {
    ...textStyles.body,
    color: colors.text,
  },
  messageTextMine: {
    color: colors.surface
  },
  composer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    paddingBottom: spacing.md,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: spacing.sm,
    backgroundColor: colors.background
  },
  composerInput: {
    flex: 1
  },
  sendButton: {
    minWidth: 54,
    minHeight: 54,
    borderRadius: radii.pill
  }
});
