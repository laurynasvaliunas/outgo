import { useCallback, useEffect, useState } from "react";
import type { CustomerInfo } from "react-native-purchases";
import {
  getActiveRevenueCatEntitlements,
  getRevenueCatCustomerInfo,
  getRevenueCatUnavailableMessage,
  hasActiveRevenueCatEntitlement,
  isRevenueCatAvailable,
  listenForRevenueCatCustomerInfo,
  revenueCatEntitlementId
} from "@/lib/revenuecat";

export function useRevenueCatCustomerInfo() {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!isRevenueCatAvailable()) {
      setCustomerInfo(null);
      return null;
    }

    setLoading(true);
    setError(null);
    try {
      const nextCustomerInfo = await getRevenueCatCustomerInfo();
      setCustomerInfo(nextCustomerInfo);
      return nextCustomerInfo;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Could not load purchase status.";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();

    const unsubscribe = listenForRevenueCatCustomerInfo((nextCustomerInfo) => {
      setCustomerInfo(nextCustomerInfo);
    });

    return unsubscribe;
  }, [refresh]);

  return {
    available: isRevenueCatAvailable(),
    customerInfo,
    loading,
    error,
    refresh,
    activeEntitlements: getActiveRevenueCatEntitlements(customerInfo),
    hasConfiguredEntitlement: hasActiveRevenueCatEntitlement(customerInfo),
    entitlementId: revenueCatEntitlementId,
    unavailableMessage: getRevenueCatUnavailableMessage()
  };
}
