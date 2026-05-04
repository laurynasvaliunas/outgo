import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Link, router } from "expo-router";
import { UserPlus } from "lucide-react-native";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { colors, fontFamilies, spacing, textStyles } from "@/lib/theme";
import { registerSchema } from "@/validation/auth";
import { registerWithEmail } from "@/services/supabase/auth";
import { track } from "@/lib/analytics";

export default function RegisterScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  const submit = async () => {
    const parsed = registerSchema.safeParse({ fullName, email, password });
    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors({
        fullName: fields.fullName?.[0],
        email: fields.email?.[0],
        password: fields.password?.[0]
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
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen centered>
      <View style={styles.header}>
        <Text style={styles.title}>Start offline</Text>
        <Text style={styles.subtitle}>
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
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          error={errors.password}
          placeholder="At least 6 characters"
        />
        <Button
          title="Create account"
          loading={loading}
          icon={<UserPlus size={18} color="#FFFFFF" />}
          onPress={submit}
        />
        <View style={styles.legal}>
          <Text style={styles.legalText}>By creating an account, you agree to the</Text>
          <View style={styles.legalLinks}>
            <Link href="/legal/terms" asChild>
              <Text style={styles.legalLink}>Terms</Text>
            </Link>
            <Text style={styles.legalText}>and</Text>
            <Link href="/legal/privacy" asChild>
              <Text style={styles.legalLink}>Privacy Policy</Text>
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
    color: colors.text,
  },
  subtitle: {
    ...textStyles.body,
    color: colors.textMuted,
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
    color: colors.textMuted,
    textAlign: "center"
  },
  legalLink: {
    ...textStyles.small,
    fontFamily: fontFamilies.bold,
    color: colors.primary500
  }
});
