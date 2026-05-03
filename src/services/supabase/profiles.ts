import { supabase } from "./client";
import type { Database } from "@/types/database";
import type { PublicProfile } from "@/types/domain";
import type { ProfileInput } from "@/validation/profile";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as PublicProfile | null;
}

export async function upsertProfile(userId: string, input: ProfileInput) {
  const payload: ProfileInsert = {
    id: userId,
    full_name: input.full_name.trim(),
    username: input.username.trim().toLowerCase(),
    avatar_url: input.avatar_url?.trim() || null,
    bio: input.bio?.trim() || null,
    city: input.city.trim(),
    age_range: input.age_range?.trim() || null,
    interests: input.interests
  };

  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    throw error;
  }

  return data as PublicProfile;
}

export function isProfileComplete(profile: PublicProfile | null) {
  return Boolean(profile?.full_name && profile?.username && profile?.city);
}
