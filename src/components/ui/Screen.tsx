import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  View,
  type ViewStyle
} from "react-native";
import type { ReactNode } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { spacing } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  centered?: boolean;
  contentStyle?: ViewStyle;
  backgroundColor?: string;
  bottomContent?: ReactNode;
  bottomContentStyle?: ViewStyle;
};

export function Screen({
  children,
  scroll = true,
  centered = false,
  contentStyle,
  backgroundColor,
  bottomContent,
  bottomContentStyle
}: ScreenProps) {
  const colors = useThemeColors();
  const resolvedBackgroundColor = backgroundColor ?? colors.background;
  const content = [styles.content, centered ? styles.centered : null, contentStyle];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: resolvedBackgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            style={styles.scroll}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={content}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={[styles.staticContent, content]}>{children}</View>
        )}
        {bottomContent ? (
          <View style={[styles.bottomContent, bottomContentStyle]}>{bottomContent}</View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  keyboard: {
    flex: 1
  },
  scroll: {
    flex: 1
  },
  staticContent: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg
  },
  bottomContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg
  },
  centered: {
    justifyContent: "center"
  }
});
