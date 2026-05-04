import { Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { legalCompany, type LegalDocument } from "@/lib/legal";
import { colors, fontFamilies, radii, spacing, textStyles } from "@/lib/theme";

type LegalDocumentViewProps = {
  document: LegalDocument;
};

export function LegalDocumentView({ document }: LegalDocumentViewProps) {
  return (
    <Screen contentStyle={styles.screen}>
      <Pressable
        accessibilityRole="button"
        onPress={() => router.back()}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <ArrowLeft size={20} color={colors.primaryDark} />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <SectionHeader
        title={document.title}
        subtitle={`${document.subtitle} Effective ${document.effectiveDate}.`}
      />

      <Card style={styles.companyCard}>
        <Text style={styles.companyTitle}>Legal operator</Text>
        <Text style={styles.companyText}>{legalCompany.legalName}</Text>
        <Text style={styles.companyText}>Company code {legalCompany.companyCode}</Text>
        <Text style={styles.companyText}>{legalCompany.address}</Text>
        <Text style={styles.companyText}>{legalCompany.phone}</Text>
        <Text style={styles.companyText}>{legalCompany.supportEmail}</Text>
      </Card>

      <View style={styles.sections}>
        {document.sections.map((section) => (
          <Card key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.body.map((paragraph) => (
              <Text key={paragraph} style={styles.paragraph}>
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
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  pressed: {
    opacity: 0.82
  },
  backText: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    color: colors.primary500
  },
  companyCard: {
    gap: spacing.xs,
    backgroundColor: colors.primarySoft
  },
  companyTitle: {
    ...textStyles.small,
    fontFamily: fontFamilies.extraBold,
    color: colors.primary700
  },
  companyText: {
    ...textStyles.small,
    color: colors.text,
  },
  sections: {
    gap: spacing.md
  },
  sectionCard: {
    gap: spacing.sm
  },
  sectionTitle: {
    ...textStyles.subheading,
    fontFamily: fontFamilies.extraBold,
    color: colors.text,
  },
  paragraph: {
    ...textStyles.body,
    color: colors.text,
  }
});
