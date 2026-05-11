import { useCallback, useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import { useRevenueCatCustomerInfo } from "./useRevenueCat";
import type { SubscriptionStatus } from "@/types/domain";
import {
  getSubscriptionStatus,
  hasActiveBackendSubscription,
  hasActivePlus
} from "@/services/supabase/subscriptions";

export function usePlusStatus() {
  const { user } = useAuth();
  const purchases = useRevenueCatCustomerInfo();
  const [backendStatus, setBackendStatus] = useState<SubscriptionStatus | null>(null);
  const [backendLoading, setBackendLoading] = useState(false);
  const [backendError, setBackendError] = useState<string | null>(null);

  const refreshBackend = useCallback(async () => {
    if (!user?.id) {
      setBackendStatus(null);
      return null;
    }

    setBackendLoading(true);
    setBackendError(null);
    try {
      const nextStatus = await getSubscriptionStatus(user.id);
      setBackendStatus(nextStatus);
      return nextStatus;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not load subscription status.";
      setBackendError(message);
      return null;
    } finally {
      setBackendLoading(false);
    }
  }, [user?.id]);

  const refresh = useCallback(async () => {
    const [customerInfo, status] = await Promise.all([
      purchases.refresh(),
      refreshBackend()
    ]);
    return { customerInfo, status };
  }, [purchases, refreshBackend]);

  useEffect(() => {
    void refreshBackend();
  }, [refreshBackend]);

  const backendActive = hasActiveBackendSubscription(backendStatus);
  const sdkActive = purchases.hasConfiguredEntitlement;
  const active = hasActivePlus({
    customerInfo: purchases.customerInfo,
    backendStatus
  });

  return {
    ...purchases,
    active,
    sdkActive,
    backendActive,
    backendStatus,
    backendLoading,
    backendError,
    loading: purchases.loading || backendLoading,
    error: purchases.error ?? backendError,
    refresh
  };
}
