import * as Sentry from "@sentry/react-native";

const dsn = process.env.EXPO_PUBLIC_SENTRY_DSN;

Sentry.init({
  dsn,
  enabled: Boolean(dsn),
  tracesSampleRate: __DEV__ ? 0 : 0.1,
  attachStacktrace: true,
  environment: __DEV__ ? "development" : "production"
});

export { Sentry };
