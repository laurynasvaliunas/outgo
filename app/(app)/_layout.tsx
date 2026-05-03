import { Redirect, Tabs } from "expo-router";
import { CalendarCheck, Compass, ListFilter, Map, User } from "lucide-react-native";
import { LoadingState } from "@/components/ui/LoadingState";
import { Screen } from "@/components/ui/Screen";
import { colors } from "@/lib/theme";
import { useAuth } from "@/hooks/useAuth";

export default function AppTabsLayout() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <Screen centered>
        <LoadingState message="Opening OutGo..." />
      </Screen>
    );
  }

  if (!session) {
    return <Redirect href="/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDark,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border
        },
        tabBarLabelStyle: {
          fontWeight: "700",
          fontSize: 12
        }
      }}
    >
      <Tabs.Screen
        name="map"
        options={{
          title: "Map",
          tabBarIcon: ({ color, size }) => <Map color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: "Discover",
          tabBarIcon: ({ color, size }) => <Compass color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="events"
        options={{
          title: "Events",
          tabBarIcon: ({ color, size }) => <ListFilter color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="plans"
        options={{
          title: "My Plans",
          tabBarIcon: ({ color, size }) => <CalendarCheck color={color} size={size} />
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color, size }) => <User color={color} size={size} />
        }}
      />
      <Tabs.Screen name="create-event" options={{ href: null }} />
      <Tabs.Screen name="paywall" options={{ href: null }} />
      <Tabs.Screen name="settings" options={{ href: null }} />
      <Tabs.Screen name="joined-events" options={{ href: null }} />
      <Tabs.Screen name="hosted-events" options={{ href: null }} />
    </Tabs>
  );
}
