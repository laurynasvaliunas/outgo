import { supabase } from "./client";
import { disableCurrentPushToken } from "./notifications";
import { upsertProfile } from "./profiles";
import type { LoginInput, RegisterInput } from "@/validation/auth";
import { authRedirects } from "@/lib/authRedirects";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getFriendlyAuthErrorMessage(error: unknown, fallback = "Please try again.") {
  const rawMessage = error instanceof Error ? error.message : "";
  const message = rawMessage.toLowerCase();

  if (message.includes("invalid login credentials")) {
    return "That email and password do not match.";
  }
  if (message.includes("email not confirmed") || message.includes("email_not_confirmed")) {
    return "Confirm your email first, then log in. You can resend the confirmation email below.";
  }
  if (message.includes("already registered") || message.includes("already exists")) {
    return "An account with this email already exists. Try logging in or resetting your password.";
  }
  if (message.includes("rate limit") || message.includes("too many")) {
    return "Too many attempts. Wait a moment, then try again.";
  }
  if (message.includes("network") || message.includes("fetch")) {
    return "Network issue. Check your connection and try again.";
  }
  if (message.includes("password")) {
    return rawMessage || fallback;
  }

  return rawMessage || fallback;
}

export async function signInWithEmail(input: LoginInput) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(input.email),
    password: input.password
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function sendPasswordResetEmail(email: string, redirectTo?: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(normalizeEmail(email), {
    redirectTo: redirectTo ?? authRedirects.passwordReset
  });

  if (error) {
    throw error;
  }
}

export async function resendConfirmationEmail(email: string, redirectTo?: string) {
  const { error } = await supabase.auth.resend({
    type: "signup",
    email: normalizeEmail(email),
    options: {
      emailRedirectTo: redirectTo ?? authRedirects.signup
    }
  });

  if (error) {
    throw error;
  }
}

export async function registerWithEmail(input: RegisterInput) {
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(input.email),
    password: input.password,
    options: {
      emailRedirectTo: authRedirects.signup,
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
      interests: [],
      hobbies: [],
      life_context: [],
      social_goals: []
    });
  }

  return data;
}

export async function updateRecoveredPassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) {
    throw error;
  }
}

export async function signOut() {
  try {
    await disableCurrentPushToken();
  } catch (error) {
    if (__DEV__) {
      console.warn("Could not disable push token before sign out", error);
    }
  }

  const { error } = await supabase.auth.signOut();
  if (error) {
    throw error;
  }
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
  if (sessionError) {
    throw sessionError;
  }

  const email = sessionData.session?.user.email;
  if (!email) {
    throw new Error("You need to be signed in with email to change your password.");
  }

  const { error: verifyError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword
  });

  if (verifyError) {
    throw new Error("Current password is incorrect.");
  }

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword
  });
  if (error) {
    throw error;
  }
}
