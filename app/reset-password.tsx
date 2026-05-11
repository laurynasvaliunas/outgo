import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { router } from "expo-router";
import { Eye, EyeOff, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColors } from "@/hooks/useAppTheme";
import {
  getFriendlyAuthErrorMessage,
  updateRecoveredPassword
} from "@/services/supabase/auth";
import { resetPasswordSchema } from "@/validation/auth";
import { spacing, textStyles } from "@/lib/theme";

export default function ResetPasswordScreen() {
  const colors = useThemeColors();
  const { session, loading, signOut } = useAuth();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const submit = async () => {
    const parsed = resetPasswordSchema.safeParse({ password, confirmPassword });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({
        password: fields.password?.[0],
        confirmPassword: fields.confirmPassword?.[0]
      });
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      await updateRecoveredPassword(parsed.data.password);
      Alert.alert(
        "Password updated",
        "Your password has been changed. Sign in again with the new password."
      );
      await signOut();
      router.replace("/login");
    } catch (error) {
      Alert.alert(
        "Could not update password",
        getFriendlyAuthErrorMessage(error)
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Screen centered>
        <LoadingState message="Opening secure reset..." />
      </Screen>
    );
  }

  if (!session) {
    return (
      <Screen centered>
        <EmptyState
          title="Open your reset link"
          message="Use the secure link from your email to set a new OutGo password."
          actionTitle="Back to login"
          onAction={() => router.replace("/login")}
        />
      </Screen>
    );
  }

  return (
    <Screen>
      <SectionHeader
        title="Reset Password"
        subtitle="Choose a new password for your OutGo account."
      />
      <View style={styles.form}>
        <Input
          label="New password"
          secureTextEntry={!passwordVisible}
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="At least 6 characters"
          rightIcon={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={passwordVisible ? "Hide password" : "Show password"}
              onPress={() => setPasswordVisible((visible) => !visible)}
            >
              {passwordVisible ? (
                <EyeOff size={20} color={colors.textMuted} />
              ) : (
                <Eye size={20} color={colors.textMuted} />
              )}
            </Pressable>
          }
        />
        <Input
          label="Confirm new password"
          secureTextEntry={!passwordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          placeholder="Repeat new password"
        />
        <Text style={[styles.note, { color: colors.textMuted }]}>
          After updating, you will sign in again with the new password.
        </Text>
        <Button
          title="Save new password"
          loading={saving}
          icon={<Lock size={18} color={colors.white} />}
          onPress={submit}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  },
  note: {
    ...textStyles.small
  }
});
