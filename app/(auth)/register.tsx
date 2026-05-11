import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Eye, EyeOff, UserPlus } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { fontFamilies, spacing, textStyles } from "@/lib/theme";
import { useThemeColors } from "@/hooks/useAppTheme";
import { registerSchema } from "@/validation/auth";
import {
  getFriendlyAuthErrorMessage,
  resendConfirmationEmail,
  registerWithEmail
} from "@/services/supabase/auth";
import { track } from "@/lib/analytics";
import { authRedirects } from "@/lib/authRedirects";

export default function RegisterScreen() {
  const colors = useThemeColors();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const submit = async () => {
    const parsed = registerSchema.safeParse({
      fullName,
      email,
      password,
      confirmPassword
    });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({
        fullName: fields.fullName?.[0],
        email: fields.email?.[0],
        password: fields.password?.[0],
        confirmPassword: fields.confirmPassword?.[0]
      });
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      const data = await registerWithEmail(parsed.data);
      track("auth_register");
      if (!data.session) {
        Alert.alert(
          "Check your email",
          "Confirm your email, then log in to finish your profile."
        );
        router.replace("/login");
        return;
      }
      router.replace("/profile/edit");
    } catch (error) {
      Alert.alert(
        "Could not register",
        getFriendlyAuthErrorMessage(error)
      );
    } finally {
      setLoading(false);
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
        <Text style={[styles.title, { color: colors.text }]}>Start offline</Text>
        <Text style={[styles.subtitle, { color: colors.textMuted }]}>
          Create an account, finish a small profile, then pick a plan.
        </Text>
      </View>
      <View style={styles.form}>
        <Input
          label="Full name"
          value={fullName}
          onChangeText={setFullName}
          error={errors.fullName}
          placeholder="Your name"
        />
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
        <Input
          label="Confirm password"
          secureTextEntry={!passwordVisible}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          error={errors.confirmPassword}
          placeholder="Repeat password"
        />
        <Button
          title="Create account"
          loading={loading}
          icon={<UserPlus size={18} color="#FFFFFF" />}
          onPress={submit}
        />
        <Button
          title="Resend confirmation"
          variant="ghost"
          loading={resendLoading}
          onPress={handleResendConfirmation}
        />
        <View style={styles.legal}>
          <Text style={[styles.legalText, { color: colors.textMuted }]}>By creating an account, you agree to the</Text>
          <View style={styles.legalLinks}>
            <Link href="/legal/terms" asChild>
              <Text style={[styles.legalLink, { color: colors.primary500 }]}>Terms</Text>
            </Link>
            <Text style={[styles.legalText, { color: colors.textMuted }]}>and</Text>
            <Link href="/legal/privacy" asChild>
              <Text style={[styles.legalLink, { color: colors.primary500 }]}>Privacy Policy</Text>
            </Link>
          </View>
        </View>
      </View>
      <Link href="/login" asChild>
        <Button title="I already have an account" variant="ghost" />
      </Link>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: spacing.sm
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
  legal: {
    gap: spacing.xs,
    alignItems: "center"
  },
  legalLinks: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs
  },
  legalText: {
    ...textStyles.small,
    textAlign: "center"
  },
  legalLink: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold
  }
});
