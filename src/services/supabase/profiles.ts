import { supabase } from "./client";
import type { Database } from "@/types/database";
import type { ProfileStats, PublicProfile } from "@/types/domain";
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
    interests: input.interests,
    hobbies: input.hobbies,
    life_context: input.life_context,
    social_goals: input.social_goals
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

export async function getProfileStats(userId: string): Promise<ProfileStats> {
  const [joinedResult, hostedResult, profileResult] = await Promise.all([
    supabase
      .from("event_participants")
      .select("event_id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("events")
      .select("id", { count: "exact", head: true })
      .eq("host_id", userId),
    supabase
      .from("profiles")
      .select("created_at")
      .eq("id", userId)
      .single()
  ]);

  if (joinedResult.error) {
    throw joinedResult.error;
  }
  if (hostedResult.error) {
    throw hostedResult.error;
  }
  if (profileResult.error) {
    throw profileResult.error;
  }

  return {
    plansJoined: joinedResult.count ?? 0,
    plansHosted: hostedResult.count ?? 0,
    memberSince: profileResult.data.created_at
  };
}
