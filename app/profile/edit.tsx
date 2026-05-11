import { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { ImagePlus, Save, Trash2 } from "lucide-react-native";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { ChipSelector } from "@/components/ui/ChipSelector";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { useAuth } from "@/hooks/useAuth";
import { useThemeColors } from "@/hooks/useAppTheme";
import {
  hobbyOptions,
  lifeContextOptions,
  socialGoalOptions
} from "@/lib/profileOptions";
import { uploadAvatar } from "@/services/supabase/storage";
import { profileSchema } from "@/validation/profile";
import { spacing, textStyles } from "@/lib/theme";
import { track } from "@/lib/analytics";

export default function EditProfileScreen() {
  const { returnTo } = useLocalSearchParams<{ returnTo?: string }>();
  const { session, profile, completeProfile, loading, signOut } = useAuth();
  const colors = useThemeColors();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [city, setCity] = useState("");
  const [ageRange, setAgeRange] = useState("");
  const [interests, setInterests] = useState("");
  const [hobbies, setHobbies] = useState<string[]>([]);
  const [lifeContext, setLifeContext] = useState<string[]>([]);
  const [socialGoals, setSocialGoals] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});

  useEffect(() => {
    if (!profile) {
      return;
    }
    setFullName(profile.full_name);
    setUsername(profile.username);
    setAvatarUrl(profile.avatar_url ?? "");
    setBio(profile.bio ?? "");
    setCity(profile.city);
    setAgeRange(profile.age_range ?? "");
    setInterests(profile.interests.join(", "));
    setHobbies(profile.hobbies ?? []);
    setLifeContext(profile.life_context ?? []);
    setSocialGoals(profile.social_goals ?? []);
  }, [profile]);

  if (loading) {
    return (
      <Screen centered>
        <LoadingState message="Opening profile..." />
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  const submit = async () => {
    const parsed = profileSchema.safeParse({
      full_name: fullName,
      username,
      avatar_url: avatarUrl,
      bio,
      city,
      age_range: ageRange,
      interests: interests
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      hobbies,
      life_context: lifeContext,
      social_goals: socialGoals
    });

    if (!parsed.success) {
      const fields = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(fields).map(([key, value]) => [key, value?.[0]])
        )
      );
      return;
    }

    setSaving(true);
    setErrors({});
    try {
      const wasComplete = Boolean(profile?.full_name && profile.username && profile.city);
      await completeProfile(parsed.data);
      track("profile_complete");
      if (!wasComplete) {
        router.replace("/map");
      } else if (typeof returnTo === "string" && returnTo.startsWith("/")) {
        router.replace(returnTo);
      } else if (router.canGoBack()) {
        router.back();
      } else {
        router.replace("/profile");
      }
    } catch (error) {
      Alert.alert(
        "Could not save profile",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    if (!session?.user.id) {
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission needed", "Allow photo access to upload an avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.82
    });

    if (result.canceled || !result.assets[0]) {
      return;
    }

    setUploading(true);
    try {
      const publicUrl = await uploadAvatar(session.user.id, result.assets[0]);
      setAvatarUrl(publicUrl);
    } catch (error) {
      Alert.alert(
        "Could not upload avatar",
        error instanceof Error ? error.message : "Please try again."
      );
    } finally {
      setUploading(false);
    }
  };

  return (
    <Screen>
      <SectionHeader
        title="Edit Profile"
        subtitle="A small profile helps hosts recognize who is joining."
      />
      <View style={styles.form}>
        <View style={styles.photoBlock}>
          <Avatar size={104} name={fullName || profile?.full_name} url={avatarUrl} />
          <View style={styles.photoActions}>
            <Button
              title={avatarUrl ? "Change photo" : "Add photo"}
              variant="secondary"
              loading={uploading}
              icon={<ImagePlus size={18} color={colors.primaryDark} />}
              onPress={pickAvatar}
            />
            {avatarUrl ? (
              <Button
                title="Remove"
                variant="ghost"
                icon={<Trash2 size={18} color={colors.danger} />}
                onPress={() => setAvatarUrl("")}
              />
            ) : null}
          </View>
        </View>
        <Input label="Full name" value={fullName} onChangeText={setFullName} error={errors.full_name} />
        <Input
          label="Username"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
          error={errors.username}
        />
        <Input label="Bio" value={bio} onChangeText={setBio} error={errors.bio} multiline placeholder="A sentence about how you like to spend offline time." />
        <Input label="City" value={city} onChangeText={setCity} error={errors.city} placeholder="Your city" />
        <Input label="Age range" value={ageRange} onChangeText={setAgeRange} error={errors.age_range} placeholder="Optional, e.g. 25-34" />
        <Input label="Interests" value={interests} onChangeText={setInterests} error={errors.interests} placeholder="coffee, walking, language exchange" />
        <ChipSelector
          label="Hobbies"
          options={hobbyOptions}
          values={hobbies}
          onChange={setHobbies}
        />
        <ChipSelector
          label="Life context"
          options={lifeContextOptions}
          values={lifeContext}
          onChange={setLifeContext}
        />
        <ChipSelector
          label="Social goals"
          options={socialGoalOptions}
          values={socialGoals}
          onChange={setSocialGoals}
        />
      </View>
      <Text style={[styles.note, { color: colors.textMuted }]}>
        Avoid sharing sensitive personal details. You can always leave an event
        or report a concern.
      </Text>
      <Button
        title="Save profile"
        loading={saving}
        icon={<Save size={18} color="#FFFFFF" />}
        onPress={submit}
      />
      {!profile?.full_name || !profile?.username || !profile?.city ? (
        <Button
          title="Sign out"
          variant="ghost"
          onPress={async () => {
            await signOut();
            router.replace("/login");
          }}
        />
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: spacing.md
  },
  photoBlock: {
    alignItems: "center",
    gap: spacing.md
  },
  photoActions: {
    alignSelf: "stretch",
    gap: spacing.sm
  },
  note: {
    ...textStyles.small,
  }
});
