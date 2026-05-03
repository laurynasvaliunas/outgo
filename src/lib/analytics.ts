type AnalyticsProperties = Record<string, string | number | boolean | null | undefined>;

export function track(eventName: string, properties: AnalyticsProperties = {}) {
  if (__DEV__) {
    console.log("[analytics]", eventName, properties);
  }
}
