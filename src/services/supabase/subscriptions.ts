import type { CustomerInfo } from "react-native-purchases";
import { supabase } from "./client";
import type { SubscriptionStatus } from "@/types/domain";
import { revenueCatEntitlementId } from "@/lib/revenuecat";

export async function getSubscriptionStatus(userId: string) {
  const { data, error } = await supabase
    .from("subscription_status")
    .select(
      "user_id, revenuecat_app_user_id, entitlement_id, is_active, product_id, store, environment, expiration_at, latest_event_type, created_at, updated_at"
    )
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data as SubscriptionStatus | null;
}

export async function refreshSubscriptionStatus(userId: string) {
  return getSubscriptionStatus(userId);
}

export function hasActiveBackendSubscription(
  status: SubscriptionStatus | null,
  entitlementId = revenueCatEntitlementId
) {
  if (!status || status.entitlement_id !== entitlementId || !status.is_active) {
    return false;
  }

  if (!status.expiration_at) {
    return true;
  }

  return new Date(status.expiration_at).getTime() > Date.now();
}

export function hasActivePlus({
  customerInfo,
  backendStatus,
  entitlementId = revenueCatEntitlementId
}: {
  customerInfo: CustomerInfo | null;
  backendStatus: SubscriptionStatus | null;
  entitlementId?: string;
}) {
  return Boolean(
    customerInfo?.entitlements.active[entitlementId]?.isActive ||
      hasActiveBackendSubscription(backendStatus, entitlementId)
  );
}
