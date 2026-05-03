import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, ChevronRight } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { legalDocumentList, type LegalDocumentSlug } from "@/lib/legal";
import { colors, radii, spacing, typography } from "@/lib/theme";

export default function LegalIndexScreen() {
  return (
    <Screen>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ArrowLeft size={20} color={colors.primaryDark} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <SectionHeader
        title="Legal"
        subtitle="Terms, privacy, subscriptions and community safety information."
      />

      <View style={styles.list}>
        {legalDocumentList.map((document) => (
          <Pressable
            key={document.slug}
            accessibilityRole="button"
            onPress={() => router.push(`/legal/${document.slug}` as `/legal/${LegalDocumentSlug}`)}
          >
            {({ pressed }) => (
              <Card style={[styles.item, pressed && styles.pressed]}>
                <View style={styles.itemCopy}>
                  <Text style={styles.itemTitle}>{document.title}</Text>
                  <Text style={styles.itemText}>{document.subtitle}</Text>
                </View>
                <ChevronRight size={20} color={colors.textMuted} />
              </Card>
            )}
          </Pressable>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  backText: {
    color: colors.primaryDark,
    fontSize: typography.small,
    fontWeight: "900"
  },
  list: {
    gap: spacing.md
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.md
  },
  itemCopy: {
    flex: 1,
    gap: spacing.xs
  },
  itemTitle: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: "900"
  },
  itemText: {
    color: colors.textMuted,
    fontSize: typography.small,
    lineHeight: 19
  },
  pressed: {
    opacity: 0.82
  }
});
