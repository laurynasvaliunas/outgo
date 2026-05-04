import type { ExpoConfig } from "expo/config";

type OutGoExpoConfig = ExpoConfig & {
  newArchEnabled?: boolean;
};

const config: OutGoExpoConfig = {
  name: "OutGo",
  slug: "outgo",
  owner: "laurynas.valiunas",
  scheme: "outgo",
  version: "0.1.0",
  icon: "./assets/images/icon.png",
  orientation: "portrait",
  userInterfaceStyle: "light",
  newArchEnabled: true,
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
      backgroundColor: "#F7F6F2"
    }
  },
  web: {
    bundler: "metro"
  },
  plugins: [
    "expo-router",
    "expo-font",
    [
      "expo-splash-screen",
      {
        backgroundColor: "#F7F6F2",
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
      "@rnmapbox/maps",
      {
        RNMapboxMapsVersion: "11.18.2"
      }
    ]
  ],
  extra: {
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabasePublishableKey:
      process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
    revenueCatIosApiKey:
      process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ??
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    revenueCatAndroidApiKey:
      process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ??
      process.env.EXPO_PUBLIC_REVENUECAT_API_KEY,
    revenueCatEntitlementId: process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID,
    revenueCatOfferingId: process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID,
    revenueCatMonthlyProductId:
      process.env.EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID,
    revenueCatYearlyProductId:
      process.env.EXPO_PUBLIC_REVENUECAT_YEARLY_PRODUCT_ID,
    mapboxAccessToken: process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN,
    defaultCity: process.env.EXPO_PUBLIC_DEFAULT_CITY ?? "Worldwide",
    eas: {
      projectId: "c72404a0-814b-4f55-bb95-4ed53424de9c"
    }
  }
};

export default config;
