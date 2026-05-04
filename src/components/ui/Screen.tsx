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
import { colors, spacing } from "@/lib/theme";

type ScreenProps = {
  children: ReactNode;
  scroll?: boolean;
  centered?: boolean;
  contentStyle?: ViewStyle;
  backgroundColor?: string;
};

export function Screen({
  children,
  scroll = true,
  centered = false,
  contentStyle,
  backgroundColor = colors.background
}: ScreenProps) {
  const content = [styles.content, centered ? styles.centered : null, contentStyle];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor }]}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {scroll ? (
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={content}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={content}>{children}</View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  keyboard: {
    flex: 1
  },
  content: {
    flexGrow: 1,
    padding: spacing.xl,
    gap: spacing.lg
  },
  centered: {
    justifyContent: "center"
  }
});
