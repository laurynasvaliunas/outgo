import {
  createServiceClient,
  jsonResponse
} from "../_shared/push.ts";

const DEFAULT_ENTITLEMENT_ID = "outgo_plus";

type RevenueCatWebhook = {
  event?: Record<string, unknown>;
  [key: string]: unknown;
};

type SubscriberEntitlement = {
  expires_date?: string | null;
  product_identifier?: string | null;
  purchase_date?: string | null;
};

type SubscriberPayload = {
  subscriber?: {
    entitlements?: Record<string, SubscriberEntitlement>;
    subscriptions?: Record<string, {
      store?: string | null;
      expires_date?: string | null;
      ownership_type?: string | null;
    }>;
  };
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    if (!verifyRevenueCatAuthorization(request)) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const webhook = (await request.json()) as RevenueCatWebhook;
    const event = webhook.event ?? webhook;
    const appUserId = stringValue(event.app_user_id);

    if (!appUserId || !isUuid(appUserId)) {
      return jsonResponse({ error: "Missing or invalid app_user_id" }, 400);
    }

    const entitlementId = resolveEntitlementId(event);
    const subscriber = await fetchRevenueCatSubscriber(appUserId);
    const state = deriveSubscriptionState(event, subscriber, entitlementId);

    const supabase = createServiceClient();
    const { error } = await supabase.from("subscription_status").upsert(
      {
        user_id: appUserId,
        revenuecat_app_user_id: appUserId,
        entitlement_id: entitlementId,
        is_active: state.isActive,
        product_id: state.productId,
        store: state.store,
        environment: state.environment,
        expiration_at: state.expirationAt,
        latest_event_type: state.latestEventType
      },
      { onConflict: "user_id" }
    );

    if (error) {
      throw error;
    }

    const { error: rawError } = await supabase
      .from("subscription_status_raw")
      .upsert(
        {
          user_id: appUserId,
          raw_customer_info: {
            webhook,
            subscriber
          }
        },
        { onConflict: "user_id" }
      );

    if (rawError) {
      throw rawError;
    }

    return jsonResponse({
      ok: true,
      userId: appUserId,
      entitlementId,
      isActive: state.isActive
    });
  } catch (error) {
    console.error(error);
    return jsonResponse(
      { error: error instanceof Error ? error.message : "Unknown error" },
      500
    );
  }
});

function verifyRevenueCatAuthorization(request: Request) {
  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH_HEADER");
  if (!expected) {
    throw new Error("Missing REVENUECAT_WEBHOOK_AUTH_HEADER.");
  }

  const authorization =
    request.headers.get("authorization") ??
    request.headers.get("x-revenuecat-authorization") ??
    "";

  return authorization === expected || authorization === `Bearer ${expected}`;
}

async function fetchRevenueCatSubscriber(appUserId: string) {
  const apiKey = Deno.env.get("REVENUECAT_REST_API_KEY");
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${encodeURIComponent(appUserId)}`,
    {
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`
      }
    }
  );

  if (!response.ok) {
    throw new Error(`RevenueCat subscriber fetch failed: ${response.status}`);
  }

  return (await response.json()) as SubscriberPayload;
}

function deriveSubscriptionState(
  event: Record<string, unknown>,
  subscriber: SubscriberPayload | null,
  entitlementId: string
) {
  const entitlement = subscriber?.subscriber?.entitlements?.[entitlementId];
  const subscription = entitlement?.product_identifier
    ? subscriber?.subscriber?.subscriptions?.[entitlement.product_identifier]
    : null;

  const expirationAt =
    parseDate(entitlement?.expires_date) ??
    parseDate(subscription?.expires_date) ??
    parseMillis(event.expiration_at_ms) ??
    parseDate(stringValue(event.expiration_at));
  const latestEventType = stringValue(event.type);
  const productId =
    entitlement?.product_identifier ??
    stringValue(event.product_id) ??
    stringValue(event.product_identifier);
  const store = subscription?.store ?? stringValue(event.store);
  const environment = stringValue(event.environment);

  if (entitlement) {
    return {
      isActive: !expirationAt || new Date(expirationAt).getTime() > Date.now(),
      productId,
      store,
      environment,
      expirationAt,
      latestEventType
    };
  }

  const activeEventTypes = new Set([
    "INITIAL_PURCHASE",
    "RENEWAL",
    "UNCANCELLATION",
    "PRODUCT_CHANGE",
    "TRANSFER"
  ]);
  const inactiveEventTypes = new Set([
    "EXPIRATION",
    "BILLING_ISSUE",
    "REFUND",
    "SUBSCRIPTION_PAUSED"
  ]);
  const eventType = latestEventType?.toUpperCase();
  const isActive =
    Boolean(expirationAt && new Date(expirationAt).getTime() > Date.now()) ||
    Boolean(eventType && activeEventTypes.has(eventType) && !inactiveEventTypes.has(eventType));

  return {
    isActive,
    productId,
    store,
    environment,
    expirationAt,
    latestEventType
  };
}

function resolveEntitlementId(event: Record<string, unknown>) {
  const explicitEntitlement = stringValue(event.entitlement_id);
  if (explicitEntitlement) {
    return explicitEntitlement;
  }

  const entitlementIds = event.entitlement_ids;
  if (Array.isArray(entitlementIds) && entitlementIds.length > 0) {
    return String(entitlementIds[0]);
  }

  return Deno.env.get("REVENUECAT_ENTITLEMENT_ID") || DEFAULT_ENTITLEMENT_ID;
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function parseMillis(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return null;
  }
  return new Date(value).toISOString();
}

function parseDate(value?: string | null) {
  if (!value) {
    return null;
  }
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value
  );
}
