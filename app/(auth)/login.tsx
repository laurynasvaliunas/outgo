import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { Mail, Lock } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { colors, fontFamilies, spacing, textStyles } from "@/lib/theme";
import { loginSchema } from "@/validation/auth";
import { signInWithEmail } from "@/services/supabase/auth";
import { track } from "@/lib/analytics";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
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
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen centered>
      <View style={styles.header}>
        <Text style={styles.emoji}>👋</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Your next quiet plan is waiting.</Text>
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
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="At least 6 characters"
        />
        <Button
          title="Log in"
          loading={loading}
          icon={<Lock size={18} color="#FFFFFF" />}
          onPress={submit}
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
          <Text style={styles.legalLink}>Terms</Text>
        </Link>
        <Text style={styles.legalText}>and</Text>
        <Link href="/legal/privacy" asChild>
          <Text style={styles.legalLink}>Privacy</Text>
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
    color: colors.text,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textMuted
  },
  form: {
    gap: spacing.md
  },
  legal: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs
  },
  legalText: {
    ...textStyles.small,
    color: colors.textMuted,
  },
  legalLink: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold,
    color: colors.primary500
  }
});
