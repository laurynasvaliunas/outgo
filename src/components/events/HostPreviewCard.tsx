import { CalendarDays, MapPin, Users } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";
import { CategoryArtwork } from "@/components/events/CategoryArtwork";
import { Card } from "@/components/ui/Card";
import { categoryMeta } from "@/lib/categories";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";
import type { EventCategory } from "@/types/domain";

type HostPreviewCardProps = {
  title: string;
  category: EventCategory;
  locationName: string;
  city: string;
  startLabel: string;
  maxParticipants: string;
};

export function HostPreviewCard({
  title,
  category,
  locationName,
  city,
  startLabel,
  maxParticipants
}: HostPreviewCardProps) {
  const colors = useThemeColors();
  const meta = categoryMeta[category];

  return (
    <Card padded={false} style={styles.card}>
      <CategoryArtwork category={category} compact label={meta.label} />
      <View style={styles.body}>
        <Text numberOfLines={2} style={[styles.title, { color: colors.text }]}>
          {title || "Your plan title"}
        </Text>
        <View style={styles.metaRow}>
          <CalendarDays size={15} color={colors.primary500} />
          <Text numberOfLines={1} style={[styles.metaText, { color: colors.textMuted }]}>{startLabel}</Text>
        </View>
        <View style={styles.metaRow}>
          <MapPin size={15} color={colors.primary500} />
          <Text numberOfLines={1} style={[styles.metaText, { color: colors.textMuted }]}>
            {locationName || city || "Public meetup place"}
          </Text>
        </View>
        <View style={styles.metaRow}>
          <Users size={15} color={colors.primary500} />
          <Text numberOfLines={1} style={[styles.metaText, { color: colors.textMuted }]}>
            Up to {maxParticipants || "6"} people
          </Text>
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    overflow: "hidden"
  },
  body: {
    padding: spacing.lg,
    gap: spacing.sm
  },
  title: {
    ...textStyles.body,
    fontFamily: fontFamilies.extraBold
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm
  },
  metaText: {
    ...textStyles.small,
    flex: 1
  }
});
