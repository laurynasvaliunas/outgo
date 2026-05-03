import type { ExpoConfig } from "expo/config";

const config: ExpoConfig = {
  name: "OutGo",
  slug: "outgo",
  owner: "laurynas.valiunas",
  scheme: "outgo",
  version: "0.1.0",
  icon: "./assets/images/icon.png",
  orientation: "portrait",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.outgo.app",
    infoPlist: {
      ITSAppUsesNonExemptEncryption: false,
      NSLocationWhenInUseUsageDescription:
        "OutGo uses your location to show nearby real-world activities."
    }
  },
  android: {
    package: "com.outgo.app",
    versionCode: 1,
    adaptiveIcon: {
      foregroundImage: "./assets/images/adaptive-icon.png",
      backgroundColor: "#F8F4EE"
    }
  },
  web: {
    bundler: "metro"
  },
  plugins: [
    "expo-router",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#F8F4EE",
        image: "./assets/images/splash-icon.png",
        imageWidth: 160
      }
    ],
    [
      "expo-location",
      {
        locationWhenInUsePermission:
          "Allow OutGo to show activities near you."
      }
    ],
    [
      "expo-image-picker",
      {
        photosPermission:
          "Allow OutGo to select a profile photo for your avatar.",
        cameraPermission:
          "Allow OutGo to take a profile photo for your avatar.",
        microphonePermission: false
      }
    ],
    [
      "react-native-maps",
      {
        androidGoogleMapsApiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
        iosGoogleMapsApiKey:
          process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? ""
      }
    ]
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabasePublishableKey:
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    defaultCity: process.env.EXPO_PUBLIC_DEFAULT_CITY ?? "Worldwide",
    eas: {
      projectId: "c72404a0-814b-4f55-bb95-4ed53424de9c"
    }
  }
};

export default config;
