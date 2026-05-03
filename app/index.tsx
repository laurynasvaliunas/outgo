import { Redirect } from "expo-router";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { useAuth } from "@/hooks/useAuth";
import { isProfileComplete } from "@/services/supabase/profiles";

export default function IndexScreen() {
  const { session, profile, loading } = useAuth();

  if (loading) {
    return (
      <Screen centered>
        <LoadingState message="Finding your offline plans..." />
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href="/onboarding" />;
  }

  if (!isProfileComplete(profile)) {
    return <Redirect href="/profile/edit" />;
  }

  return <Redirect href="/map" />;
}
