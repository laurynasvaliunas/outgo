import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { Sentry } from "@/lib/sentry";
import { syncRevenueCatUser } from "@/lib/revenuecat";

function RevenueCatBridge() {
  const { loading, user } = useAuth();

  useEffect(() => {
    if (loading) {
      return;
    }

    syncRevenueCatUser(user?.id ?? null).catch((error) => {
      if (__DEV__) {
        console.warn("Could not sync RevenueCat user", error);
      }
    });
  }, [loading, user?.id]);

  return null;
}

function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RevenueCatBridge />
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }} />
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

export default Sentry.wrap(RootLayout);
