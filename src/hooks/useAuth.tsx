import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/services/supabase/client";
import { getProfile, upsertProfile } from "@/services/supabase/profiles";
import { signOut as signOutService } from "@/services/supabase/auth";
import type { PublicProfile } from "@/types/domain";
import type { ProfileInput } from "@/validation/profile";

type AuthContextValue = {
  session: Session | null;
  user: User | null;
  profile: PublicProfile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  completeProfile: (input: ProfileInput) => Promise<PublicProfile>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId?: string) => {
    if (!userId) {
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await getProfile(userId);
      setProfile(nextProfile);
    } catch (error) {
      console.warn("Could not load profile", error);
      setProfile(null);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    await loadProfile(session?.user.id);
  }, [loadProfile, session?.user.id]);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data }) => {
        if (!mounted) {
          return;
        }
        setSession(data.session);
        await loadProfile(data.session?.user.id);
      })
      .catch((error) => {
        console.warn("Could not restore session", error);
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, nextSession) => {
        setSession(nextSession);
        await loadProfile(nextSession?.user.id);
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const completeProfile = useCallback(
    async (input: ProfileInput) => {
      if (!session?.user.id) {
        throw new Error("You need to be signed in to update your profile.");
      }

      const nextProfile = await upsertProfile(session.user.id, input);
      setProfile(nextProfile);
      return nextProfile;
    },
    [session?.user.id]
  );

  const signOut = useCallback(async () => {
    await signOutService();
    setSession(null);
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      completeProfile,
      signOut
    }),
    [completeProfile, loading, profile, refreshProfile, session, signOut]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return context;
}
