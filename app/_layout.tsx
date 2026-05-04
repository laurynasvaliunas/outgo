import { useEffect } from "react";
import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { StatusBar } from "expo-status-bar";
import { useFonts } from "expo-font";
import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold
} from "@expo-google-fonts/plus-jakarta-sans";
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
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold
  });

  if (!fontsLoaded) {
    return null;
  }

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
