import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useThemeColors } from "@/hooks/useAppTheme";
import { legalCompany, type LegalDocument } from "@/lib/legal";
import { fontFamilies, radii, spacing, textStyles } from "@/lib/theme";

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  const colors = useThemeColors();

  return (
    <Screen contentStyle={styles.screen}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [
          styles.backButton,
          { backgroundColor: colors.surface, borderColor: colors.border },
          pressed && styles.pressed
        ]}
      >
        <ArrowLeft size={20} color={colors.primaryDark} />
        <Text style={[styles.backText, { color: colors.primary500 }]}>Back</Text>
      </Pressable>

      <SectionHeader
        title={document.title}
        subtitle={`${document.subtitle} Effective ${document.effectiveDate}.`}
      />

      <Card style={[styles.companyCard, { backgroundColor: colors.primarySoft }]}>
        <Text style={[styles.companyTitle, { color: colors.primary700 }]}>Legal operator</Text>
        <Text style={[styles.companyText, { color: colors.text }]}>{legalCompany.legalName}</Text>
        <Text style={[styles.companyText, { color: colors.text }]}>Company code {legalCompany.companyCode}</Text>
        <Text style={[styles.companyText, { color: colors.text }]}>{legalCompany.address}</Text>
        <Text style={[styles.companyText, { color: colors.text }]}>{legalCompany.phone}</Text>
        <Text style={[styles.companyText, { color: colors.text }]}>{legalCompany.supportEmail}</Text>
      </Card>

      <View style={styles.sections}>
        {document.sections.map((section) => (
          <Card key={section.title} style={styles.sectionCard}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
            {section.body.map((paragraph) => (
              <Text key={paragraph} style={[styles.paragraph, { color: colors.text }]}>
                {paragraph}
              </Text>
            ))}
          </Card>
        ))}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    gap: spacing.lg
  },
  backButton: {
    alignSelf: "flex-start",
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: undefined
  },
  pressed: {
    opacity: 0.82
  },
  backText: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  companyCard: {
    gap: spacing.xs
  },
  companyTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold
  },
  companyText: {
    ...textStyles.small
  },
  sections: {
    gap: spacing.md
  },
  sectionCard: {
    gap: spacing.sm
  },
  sectionTitle: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold
  },
  paragraph: {
    ...textStyles.body
  }
});
