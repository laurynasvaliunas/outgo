import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Eye, EyeOff, Mail, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";
import { loginSchema } from "@/validation/auth";
import {
  getFriendlyAuthErrorMessage,
  resendConfirmationEmail,
  sendPasswordResetEmail,
  signInWithEmail
} from "@/services/supabase/auth";
import { track } from "@/lib/analytics";
import { authRedirects } from "@/lib/authRedirects";

export default function LoginScreen() {
  const colors = useThemeColors();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const submit = async () => {
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({
        email: fields.email?.[0],
        password: fields.password?.[0]
      });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await signInWithEmail(parsed.data);
      track("auth_login");
      router.replace("/");
    } catch (error) {
      Alert.alert(
        "Could not log in",
        getFriendlyAuthErrorMessage(error)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors((current) => ({
        ...current,
        email: "Enter your email first."
      }));
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(trimmedEmail, authRedirects.passwordReset);
      Alert.alert(
        "Check your email",
        "We sent a secure password reset link if this email has an OutGo account."
      );
    } catch (error) {
      Alert.alert(
        "Could not send reset link",
        getFriendlyAuthErrorMessage(error)
      );
    } finally {
      setResetLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrors((current) => ({
        ...current,
        email: "Enter your email first."
      }));
      return;
    }

    setResendLoading(true);
    try {
      await resendConfirmationEmail(trimmedEmail, authRedirects.signup);
      Alert.alert(
        "Confirmation sent",
        "If this email has an unconfirmed OutGo account, a new confirmation link is on the way."
      );
    } catch (error) {
      Alert.alert(
        "Could not resend confirmation",
        getFriendlyAuthErrorMessage(error)
      );
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Screen centered>
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={[styles.title, { color: colors.text }]}>Welcome back</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>Your next quiet plan is waiting.</Text>
      </View>
      <View style={styles.form}>
        <Input
          label="Email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
          error={errors.email}
          placeholder="you@example.com"
        />
        <Input
          label="Password"
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
        <Button
          title="Log in"
          loading={loading}
          icon={<Lock size={18} color="#FFFFFF" />}
          onPress={submit}
        />
        <Button
          title="Forgot password?"
          variant="ghost"
          loading={resetLoading}
          onPress={handleForgotPassword}
          style={styles.forgotButton}
        />
        <Button
          title="Resend confirmation"
          variant="ghost"
          loading={resendLoading}
          onPress={handleResendConfirmation}
          style={styles.forgotButton}
        />
      </View>
      <Link href="/register" asChild>
        <Button
          title="Create an account"
          variant="ghost"
          icon={<Mail size={18} color={colors.primaryDark} />}
        />
      </Link>
      <View style={styles.legal}>
        <Link href="/legal/terms" asChild>
          <Text style={[styles.legalLink, { color: colors.primary500 }]}>Terms</Text>
        </Link>
        <Text style={[styles.legalText, { color: colors.textMuted }]}>and</Text>
        <Link href="/legal/privacy" asChild>
          <Text style={[styles.legalLink, { color: colors.primary500 }]}>Privacy</Text>
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm
  },
  emoji: {
    fontSize: 40,
    lineHeight: 48
  },
  title: {
    ...textStyles.title,
  },
  subtitle: {
    ...textStyles.body,
  },
  form: {
    gap: spacing.md
  },
  forgotButton: {
    alignSelf: "center",
    minHeight: 38,
    paddingHorizontal: spacing.md
  },
  legal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  legalText: {
    ...textStyles.small,
  },
  legalLink: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  }
});
