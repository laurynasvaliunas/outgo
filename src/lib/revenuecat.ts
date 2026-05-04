import { Platform } from "react-native";
import Purchases, {
  LOG_LEVEL,
  PURCHASES_ERROR_CODE,
  type CustomerInfo,
  type CustomerInfoUpdateListener,
  type PurchasesError,
  type PurchasesOffering,
  type PurchasesPackage
} from "react-native-purchases";

const DEFAULT_ENTITLEMENT_ID = "outgo_plus";
const DEFAULT_OFFERING_ID = "default";
const DEFAULT_MONTHLY_PRODUCT_ID = "outgo_plus_monthly";
const DEFAULT_YEARLY_PRODUCT_ID = "outgo_plus_yearly";
const TEST_API_KEY_PREFIX = "test_";

const revenueCatApiKey = process.env.EXPO_PUBLIC_REVENUECAT_API_KEY;
const revenueCatIosApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_IOS_API_KEY ?? revenueCatApiKey;
const revenueCatAndroidApiKey =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY ?? revenueCatApiKey;

export const revenueCatEntitlementId =
  process.env.EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID?.trim() ||
  DEFAULT_ENTITLEMENT_ID;
export const revenueCatOfferingId =
  process.env.EXPO_PUBLIC_REVENUECAT_OFFERING_ID?.trim() || DEFAULT_OFFERING_ID;
export const revenueCatMonthlyProductId =
  process.env.EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID?.trim() ||
  DEFAULT_MONTHLY_PRODUCT_ID;
export const revenueCatYearlyProductId =
  process.env.EXPO_PUBLIC_REVENUECAT_YEARLY_PRODUCT_ID?.trim() ||
  DEFAULT_YEARLY_PRODUCT_ID;

let configured = false;
let configuredAppUserId: string | null = null;
let warnedMissingKey = false;
let warnedTestKeyInRelease = false;

function normalizeApiKey(apiKey?: string | null) {
  const trimmedApiKey = apiKey?.trim();
  return trimmedApiKey ? trimmedApiKey : null;
}

function getRawRevenueCatApiKey() {
  if (Platform.OS === "ios") {
    return normalizeApiKey(revenueCatIosApiKey);
  }
  if (Platform.OS === "android") {
    return normalizeApiKey(revenueCatAndroidApiKey);
  }
  return null;
}

function isTestRevenueCatApiKey(apiKey: string | null) {
  return apiKey?.startsWith(TEST_API_KEY_PREFIX) ?? false;
}

export function getRevenueCatUnavailableMessage() {
  if (Platform.OS === "web") {
    return "RevenueCat purchases are available in native iOS and Android builds.";
  }

  const rawApiKey = getRawRevenueCatApiKey();
  if (!rawApiKey) {
    return "Add the RevenueCat public SDK key and run an EAS development or TestFlight build to test subscriptions.";
  }

  if (!__DEV__ && isTestRevenueCatApiKey(rawApiKey)) {
    return "This build has a RevenueCat test API key. Add the production iOS public SDK key in RevenueCat and rebuild for TestFlight.";
  }

  return null;
}

export function getRevenueCatApiKey() {
  const rawApiKey = getRawRevenueCatApiKey();
  if (!rawApiKey || (!__DEV__ && isTestRevenueCatApiKey(rawApiKey))) {
    return null;
  }

  return rawApiKey;
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
    const rawApiKey = getRawRevenueCatApiKey();
    if (!__DEV__ && isTestRevenueCatApiKey(rawApiKey)) {
      if (!warnedTestKeyInRelease) {
        console.warn(
          "Ignoring RevenueCat test API key in a release build. Add the production public SDK key before testing purchases in TestFlight."
        );
        warnedTestKeyInRelease = true;
      }
      return false;
    }

    if (!warnedMissingKey) {
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

export async function getRevenueCatPaywallOffering() {
  if (!configureRevenueCat(configuredAppUserId)) {
    return null;
  }

  const offerings = await Purchases.getOfferings();
  return offerings.all[revenueCatOfferingId] ?? offerings.current;
}

export function getRevenueCatPaywallPackages(
  offering: PurchasesOffering | null
) {
  const availablePackages = offering?.availablePackages ?? [];
  const monthly =
    offering?.monthly ??
    availablePackages.find(
      (candidate) => candidate.product.identifier === revenueCatMonthlyProductId
    ) ??
    availablePackages.find(
      (candidate) =>
        candidate.product.subscriptionPeriod === "P1M" ||
        candidate.identifier.toLowerCase().includes("month") ||
        candidate.product.identifier.toLowerCase().includes("month")
    ) ??
    null;

  const yearly =
    offering?.annual ??
    availablePackages.find(
      (candidate) => candidate.product.identifier === revenueCatYearlyProductId
    ) ??
    availablePackages.find(
      (candidate) =>
        candidate.product.subscriptionPeriod === "P1Y" ||
        candidate.identifier.toLowerCase().includes("annual") ||
        candidate.identifier.toLowerCase().includes("year") ||
        candidate.product.identifier.toLowerCase().includes("annual") ||
        candidate.product.identifier.toLowerCase().includes("year")
    ) ??
    null;

  return { monthly, yearly };
}

export async function purchaseRevenueCatPackage(aPackage: PurchasesPackage) {
  if (!configureRevenueCat(configuredAppUserId)) {
    return null;
  }

  const result = await Purchases.purchasePackage(aPackage);
  return result.customerInfo;
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

export function isRevenueCatPurchaseCancelled(error: unknown) {
  const purchasesError = error as Partial<PurchasesError> | null;
  return (
    purchasesError?.userCancelled === true ||
    purchasesError?.code === PURCHASES_ERROR_CODE.PURCHASE_CANCELLED_ERROR
  );
}
