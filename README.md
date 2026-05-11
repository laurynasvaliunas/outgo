# OutGo

OutGo is an Expo React Native MVP for discovering and joining small real-world activities anywhere: coffee, walks, study sessions, board games, language exchange, no-phone meetups and other low-pressure plans.

The app is intentionally not built like an addictive social feed. Users browse a bounded list or map, join a plan, use participant-only chat for logistics, then go offline.

## Stack

- Expo React Native with TypeScript and Expo Router
- Supabase Auth, Postgres, Storage, Realtime and Row Level Security
- Sentry error tracking
- RevenueCat purchases/subscriptions
- Expo Push Service notifications through `expo-notifications`
- Mapbox maps through `@rnmapbox/maps`
- StyleSheet-based design system
- Zod validation
- date-fns date formatting
- Console/no-op analytics wrapper in `src/lib/analytics.ts`

## Project Structure

- `app/` - Expo Router screens and navigation groups
- `src/components/` - reusable UI and event components
- `src/hooks/` - auth, events and realtime chat hooks
- `src/lib/legal.ts` - in-app legal documents and company details
- `src/lib/revenuecat.ts` - RevenueCat SDK setup and entitlement helpers
- `src/services/supabase/` - typed Supabase client and data services
- `src/types/` - domain and Supabase database types
- `src/validation/` - Zod schemas
- `supabase/migrations/` - schema, constraints, RLS, storage policies and realtime setup
- `supabase/functions/` - Edge Functions for push dispatch and event reminders
- `supabase/seed/` - demo data, currently with Vilnius examples

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create `.env` from the template:

```bash
cp .env.example .env
```

3. Create a Supabase project and fill:

```bash
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
EXPO_PUBLIC_SENTRY_DSN=
EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN=
# Secret native build variable. Do not prefix with EXPO_PUBLIC.
RNMAPBOX_MAPS_DOWNLOAD_TOKEN=
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=outgo_plus
EXPO_PUBLIC_REVENUECAT_OFFERING_ID=default
EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID=outgo_plus_monthly
EXPO_PUBLIC_REVENUECAT_YEARLY_PRODUCT_ID=outgo_plus_yearly
EXPO_PUBLIC_TERMS_URL=
EXPO_PUBLIC_PRIVACY_URL=
EXPO_PUBLIC_LEGAL_EMAIL=support@outgo.app
EXPO_PUBLIC_PRIVACY_EMAIL=privacy@outgo.app
EXPO_PUBLIC_DEFAULT_CITY=Worldwide
# Supabase Edge Function secret, set with `supabase secrets set`.
# OUTGO_PUSH_WEBHOOK_SECRET=
```

4. Apply the database migration in Supabase SQL Editor or with Supabase CLI:

```bash
supabase link --project-ref your-project-ref
supabase db push
```

5. Seed demo data:

```bash
supabase db reset
```

The seed creates demo accounts:

- `demo-host@outgo.app` / `outgo123`
- `demo-walker@outgo.app` / `outgo123`

For a hosted Supabase project, you can also paste `supabase/seed/seed_vilnius.sql` into SQL Editor after the migration.

6. Run the app:

```bash
npm run start
```

Use a development/TestFlight build for the native Mapbox map and real RevenueCat purchase testing. `@rnmapbox/maps` requires custom native code, so the map screen cannot run inside Expo Go.

## Mapbox

The app uses a public runtime token in `EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN`. This token renders the map and is safe to expose in the mobile app binary.

For EAS native builds, add the secret download token to EAS as `RNMAPBOX_MAPS_DOWNLOAD_TOKEN`. Supabase secrets are only available to Supabase Edge Functions and are not read by EAS Build.

```bash
npx eas env:create production --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value your-mapbox-public-token --visibility plaintext
npx eas env:create production --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN --value your-mapbox-secret-download-token --visibility secret
```

Mapbox is initialized in `src/components/maps/EventMap.tsx`. The web route intentionally uses a simple fallback list until the web app has its own browser map implementation.

## Supabase Notes

The migration creates:

- `profiles`, `events`, `event_participants`, `event_favorites`, `event_messages`, `reports`
- `push_tokens`, `notification_preferences` and `notification_deliveries`
- `subscription_status` for RevenueCat-backed Plus status
- enum types for event category, price type and event status
- RLS policies for public profiles, published events, owner-only profile/event writes, full-event join prevention, favorites, participant-only chat, user reports, user-owned push tokens and notification preferences
- an `avatars` public storage bucket with owner-scoped upload/update/delete policies
- realtime publication for `event_messages`
- database triggers that call the push dispatcher for event chat, joins, event updates/cancellations and report status changes
- a Supabase Cron job that invokes event reminders every 5 minutes

The join rules are enforced both by RLS and a trigger-backed `can_join_event` function. Duplicate joins are blocked by the `(event_id, user_id)` primary key.

## Push Notifications

OutGo uses Expo Push Service with Supabase token storage and Edge Functions. Notifications are transactional only:

- event chat messages, except the sender
- new joins for event hosts
- event detail updates and cancellations for joined participants
- report status updates
- event reminders 24 hours and 1 hour before joined or hosted plans

Push notifications require a physical device and a development/TestFlight/App Store build. They do not work reliably in Expo Go, and iOS simulators cannot receive remote push notifications.

Install and config are already included through `expo-notifications`, `expo-device` and the `expo-notifications` config plugin. For iOS, EAS must have valid APNs credentials for `com.outgo.app`. If you build with EAS, the interactive build/credentials flow can create them. If you archive locally with Xcode, run:

```bash
npx eas credentials
```

Then configure iOS push credentials for the `production` app identifier.

Deploy the Supabase Edge Functions:

```bash
supabase functions deploy push-dispatch --no-verify-jwt
supabase functions deploy send-event-reminders --no-verify-jwt
supabase functions deploy revenuecat-webhook --no-verify-jwt
supabase functions deploy delete-account
```

Set the Edge Function secret used by the database triggers. Use a long random value and keep it the same in Supabase secrets and Vault:

```bash
supabase secrets set OUTGO_PUSH_WEBHOOK_SECRET=your-long-random-secret
supabase secrets set REVENUECAT_WEBHOOK_AUTH_HEADER="Bearer your-revenuecat-webhook-secret"
supabase secrets set REVENUECAT_REST_API_KEY=your-revenuecat-rest-api-key
# Optional only if Expo enhanced push security is enabled in the Expo dashboard:
supabase secrets set EXPO_PUSH_ACCESS_TOKEN=your-expo-push-access-token
```

Store the project URL and webhook secret in Supabase Vault so Postgres triggers and Cron can call the Edge Functions:

```sql
select vault.create_secret('https://your-project-ref.supabase.co', 'outgo_project_url');
select vault.create_secret('your-long-random-secret', 'outgo_push_webhook_secret');
```

After a device grants permission, the app stores its Expo push token in `push_tokens` and creates default `notification_preferences`. Settings lets users disable all notifications or individual categories.

## Testable MVP Flows

1. Register with email and password.
2. Complete profile, including optional avatar upload.
3. Browse Discover, Event List and Map.
4. Filter events by category, date, price, distance and vibe.
5. Open event details.
6. Join an event, then confirm it appears in My Plans.
7. Open event chat after joining and send a message.
8. Save/favorite an event.
9. Create and publish a new event.
10. See hosted events in My Plans or My Hosted Events.
11. Report an event or user.
12. Enable/disable notification categories in Settings.
13. Sign out and log back in.

## Sentry

Set `EXPO_PUBLIC_SENTRY_DSN` to enable runtime capture. The settings screen includes a test capture button. For production source maps, add your Sentry org/project/auth token to CI and run the Sentry Expo upload step during builds.

## Legal

In-app legal documents live in `src/lib/legal.ts` and are rendered through `app/legal/*`:

- `/legal/terms` - Terms and Conditions
- `/legal/privacy` - Privacy Policy
- `/legal/subscriptions` - Subscription Terms
- `/legal/community` - Community and Safety Guidelines

The documents use these operator details:

- Legal name: `Clyzio MB`
- Company code: `307107260`
- Address: `Polocko g. 2-2, LT-01204 Vilnius, Lithuania`
- Phone: `+370 615 41336`

Legal links appear in onboarding, login, registration, Settings, and the OutGo Plus paywall. For App Store review, also publish the Terms and Privacy Policy as publicly accessible web URLs and add them in App Store Connect. Apple requires a privacy policy URL for apps and subscription apps should include functional Terms and Privacy links in the app and metadata.

## RevenueCat

RevenueCat is initialized in `app/_layout.tsx` through `src/lib/revenuecat.ts`. Supabase user IDs are sent as RevenueCat App User IDs after auth is restored. Settings includes basic customer-info and restore-purchases checks, plus an OutGo Plus paywall at `/paywall`.

Configure platform API keys:

```bash
EXPO_PUBLIC_REVENUECAT_IOS_API_KEY=your-revenuecat-ios-key
EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY=your-revenuecat-android-key
EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID=outgo_plus
EXPO_PUBLIC_REVENUECAT_OFFERING_ID=default
EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID=outgo_plus_monthly
EXPO_PUBLIC_REVENUECAT_YEARLY_PRODUCT_ID=outgo_plus_yearly
```

Use RevenueCat production public SDK keys for TestFlight and App Store builds. RevenueCat `test_...` keys are only for local/development testing; iOS release builds can show a "Wrong API Key" alert and close the app when a test key is used. OutGo ignores `test_...` keys in release builds so TestFlight stays usable, but purchases remain unavailable until a production key is configured and the app is rebuilt.

Create one RevenueCat entitlement named `outgo_plus`, one offering named `default`, and attach two subscription packages:

- Monthly product ID: `outgo_plus_monthly`, target price: EUR 3/month
- Yearly product ID: `outgo_plus_yearly`, target price: EUR 24/year

The app shows fallback price copy of `€3` and `€24`, but the checkout price is always confirmed by the App Store or Google Play from the configured store products.

Real purchases require an EAS development build or TestFlight/App Store build. Expo Go can preview app flows, but it cannot complete real in-app purchases.

For trusted backend subscription state, configure a RevenueCat webhook:

- URL: `https://your-project-ref.supabase.co/functions/v1/revenuecat-webhook`
- Authorization header: the exact value stored in `REVENUECAT_WEBHOOK_AUTH_HEADER`, for example `Bearer your-revenuecat-webhook-secret`
- Event environment: configure production and sandbox as needed for TestFlight testing
- REST API key: store in Supabase as `REVENUECAT_REST_API_KEY` so the function can fetch canonical subscriber status after webhook events

The webhook upserts `subscription_status` by Supabase user ID / RevenueCat App User ID. The app still uses the RevenueCat SDK for immediate purchase feedback, then reads `subscription_status` as the trusted backend source for future Plus-gated features.

## Auth Production Checklist

Supabase Auth redirect URLs should include:

- `outgo://**`
- your public marketing/legal website URLs, for example `https://your-domain.example/**`
- development callback URLs only while testing

Set the Supabase Site URL to your public website, configure custom SMTP before production launch, and update email templates so confirmation and password reset copy clearly says the link opens OutGo. The app sends signup confirmation links to `outgo://` and password reset links to `outgo://reset-password`.

For bot protection, configure Supabase dashboard rate limits and CAPTCHA/bot protection when you choose a CAPTCHA provider. No CAPTCHA UI is bundled in this mobile pass.

## Account Deletion

Settings includes an account deletion flow. It calls the `delete-account` Edge Function with the signed-in user's JWT and requires the confirmation text `DELETE`. The function removes avatar files and deletes the Supabase Auth user. Personal profile-owned rows are removed by cascade, while safety reports are retained with deleted users/events detached so moderation evidence is not erased. Deleting an OutGo account does not cancel App Store or Google Play subscriptions; users must cancel subscriptions through their store account settings.

## TestFlight

The EAS project is `@laurynas.valiunas/outgo` and the iOS bundle ID is `com.outgo.app`.

Before archiving, configure production env vars:

```bash
npx eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_URL --value https://your-project-ref.supabase.co
npx eas env:create --environment production --name EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY --value your-supabase-publishable-key
npx eas env:create --environment production --name EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN --value your-mapbox-public-token --visibility plaintext
npx eas env:create --environment production --name RNMAPBOX_MAPS_DOWNLOAD_TOKEN --value your-mapbox-secret-download-token --visibility secret
npx eas env:create --environment production --name EXPO_PUBLIC_DEFAULT_CITY --value Worldwide
```

Optional production env vars:

```bash
npx eas env:create --environment production --name EXPO_PUBLIC_SENTRY_DSN --value your-sentry-dsn
npx eas env:create --environment production --name EXPO_PUBLIC_REVENUECAT_IOS_API_KEY --value your-revenuecat-ios-key
npx eas env:create --environment production --name EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY --value your-revenuecat-android-key
npx eas env:create --environment production --name EXPO_PUBLIC_REVENUECAT_ENTITLEMENT_ID --value outgo_plus
npx eas env:create --environment production --name EXPO_PUBLIC_REVENUECAT_OFFERING_ID --value default
npx eas env:create --environment production --name EXPO_PUBLIC_REVENUECAT_MONTHLY_PRODUCT_ID --value outgo_plus_monthly
npx eas env:create --environment production --name EXPO_PUBLIC_REVENUECAT_YEARLY_PRODUCT_ID --value outgo_plus_yearly
npx eas env:create --environment production --name EXPO_PUBLIC_TERMS_URL --value https://your-domain.example/terms
npx eas env:create --environment production --name EXPO_PUBLIC_PRIVACY_URL --value https://your-domain.example/privacy
npx eas env:create --environment production --name EXPO_PUBLIC_LEGAL_EMAIL --value support@outgo.app
npx eas env:create --environment production --name EXPO_PUBLIC_PRIVACY_EMAIL --value privacy@outgo.app
```

Then run the first iOS archive interactively so EAS can validate or create Apple signing credentials:

```bash
npx eas build --platform ios --profile production --auto-submit
```

For submission, App Store Connect must have an app record for `OutGo` with bundle ID `com.outgo.app`, or the interactive EAS submit flow must be allowed to create/select it. If App Store Connect asks about export compliance, this app is configured with `ITSAppUsesNonExemptEncryption=false`.

## Future TODO

- Admin moderation dashboard for reports and flagged events
- Event edit/cancel flow and host participant management
- Location search/geocoding instead of manual coordinates
- Native date/time picker for event creation
- Calendar export and quiet reminder settings
- Supabase Edge Functions for richer moderation workflows
- Subscriber-only feature gates and subscription management UX
- OpenAI-assisted event drafting in a separate `src/services/openai/` module, disabled unless explicitly configured
- City-specific discovery pages with localized categories and featured neighborhoods
- End-to-end tests with seeded local Supabase data
