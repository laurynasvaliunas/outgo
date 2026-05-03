import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  type CustomerInfo,
  type CustomerInfoUpdateListener
} from "react-native-purchases";

const revenueCatApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const revenueCatIosApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? revenueCatApiKey;
const revenueCatAndroidApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? revenueCatApiKey;

export const revenueCatEntitlementId =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() || null;

let configured = false;
let configuredAppUserId: string | null = null;
let warnedMissingKey = false;

export function getRevenueCatApiKey() {
  if (Platform.OS === "ios") {
    return revenueCatIosApiKey;
  }
  if (Platform.OS === "android") {
    return revenueCatAndroidApiKey;
  }
  return null;
}

export function isRevenueCatAvailable() {
  return Platform.OS !== "web" && Boolean(getRevenueCatApiKey());
}

export function configureRevenueCat(appUserId?: string | null) {
  if (Platform.OS === "web") {
    return false;
  }

  const apiKey = getRevenueCatApiKey();
  if (!apiKey) {
    if (__DEV__ && !warnedMissingKey) {
      console.warn(
        "Missing RevenueCat API key. Add EXPO_PUBLIC_REVENUECAT_IOS_API_KEY and/or EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY."
      );
      warnedMissingKey = true;
    }
    return false;
  }

  if (configured) {
    return true;
  }

  void Purchases.setLogLevel(__DEV__ ? LOG_LEVEL.DEBUG : LOG_LEVEL.INFO);
  Purchases.configure({
    apiKey,
    appUserID: appUserId ?? null
  });
  configured = true;
  configuredAppUserId = appUserId ?? null;
  return true;
}

export async function syncRevenueCatUser(appUserId?: string | null) {
  const nextAppUserId = appUserId ?? null;
  if (!configureRevenueCat(nextAppUserId)) {
    return null;
  }

  if (nextAppUserId && configuredAppUserId !== nextAppUserId) {
    const result = await Purchases.logIn(nextAppUserId);
    configuredAppUserId = nextAppUserId;
    return result.customerInfo;
  }

  if (!nextAppUserId && configuredAppUserId) {
    const customerInfo = await Purchases.logOut();
    configuredAppUserId = null;
    return customerInfo;
  }

  return null;
}

export async function getRevenueCatCustomerInfo() {
  if (!configureRevenueCat(configuredAppUserId)) {
    return null;
  }

  return Purchases.getCustomerInfo();
}

export async function restoreRevenueCatPurchases() {
  if (!configureRevenueCat(configuredAppUserId)) {
    return null;
  }

  return Purchases.restorePurchases();
}

export function listenForRevenueCatCustomerInfo(
  listener: CustomerInfoUpdateListener
) {
  if (!configureRevenueCat(configuredAppUserId)) {
    return () => {};
  }

  Purchases.addCustomerInfoUpdateListener(listener);
  return () => {
    Purchases.removeCustomerInfoUpdateListener(listener);
  };
}

export function getActiveRevenueCatEntitlements(customerInfo: CustomerInfo | null) {
  return Object.keys(customerInfo?.entitlements.active ?? {});
}

export function hasActiveRevenueCatEntitlement(
  customerInfo: CustomerInfo | null,
  entitlementId = revenueCatEntitlementId
) {
  if (!customerInfo || !entitlementId) {
    return false;
  }

  return Boolean(customerInfo.entitlements.active[entitlementId]?.isActive);
}
