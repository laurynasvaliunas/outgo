import { supabase } from "./client";
import { upsertProfile } from "./profiles";
import type { LoginInput, RegisterInput } from "@/validation/auth";

export async function signInWithEmail(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: input.email.trim(),
    password: input.password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function registerWithEmail(input: RegisterInput) {
  const { data, error } = await supabase.auth.signUp({
    email: input.email.trim(),
    password: input.password,
    options: {
      data: {
        full_name: input.fullName.trim()
      }
    }
  });

  if (error) {
    throw error;
  }

  if (data.session?.user) {
    await upsertProfile(data.session.user.id, {
      full_name: input.fullName.trim(),
      username: `user_${data.session.user.id.slice(0, 8)}`,
      avatar_url: "",
      bio: "",
      city: "",
      age_range: "",
      interests: []
    });
  }

  return data;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}
