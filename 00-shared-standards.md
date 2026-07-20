# Shared Standards (binding for every app)

These conventions apply to all five repos and all 15 apps. App plans document only deviations.
They mirror the working patterns of the Options Pricing Suite (`C:\dev\OptionPricer`) and Only
Breaking (`C:\Users\djpatel\Documents\Code\headlines`).

## 1. Product charter (non-negotiable)

1. **No accounts.** No email, no password, no profile. Where push notifications require a server,
   use anonymous device sessions exactly as Only Breaking does (a device row keyed by a locally
   generated UUID + Expo push token; nothing personally identifying).
2. **No ads, no third-party analytics or tracking SDKs.** No Firebase Analytics, no Sentry
   auto-PII, no Meta/Google ad SDKs. Crash reporting, if added, must be opt-in and scrubbed
   (Sentry with `sendDefaultPii: false`, IP scrubbing on).
3. **Local by default.** Data leaves the device only when a feature is impossible without it
   (push matching). Calculators and life-admin apps must work in airplane mode.
4. **Minimal permissions.** No GPS unless the app is unusable without it — prefer manually entered
   location (ZIP code / city picker), mirroring Only Breaking's manually selected home state. No
   contacts access except Big Buttons' call sheet (explicitly user-initiated). Camera only for
   apps that photograph receipts/rooms/barcodes.
5. **Quiet notifications.** Every push must pass the test: *"Would the user thank us for this
   interruption?"* Each app plan defines an explicit notification budget. Never send marketing,
   streaks, re-engagement, or digest-that-could-wait pushes. Respect OS notification channels
   (Android) and interruption levels (iOS) so users can tune without leaving the app.
6. **Free at launch, IAP-ready.** No billing SDK in MVP. Every app includes the entitlements seam
   (§6) so a one-time Pro unlock can be added later without refactoring.
7. **Honest empty states.** When there is nothing to show, say so plainly. Never pad feeds.

## 2. Tech stack

- **Node.js** 22.13+ (`engines` field enforced; `.nvmrc` committed).
- **Package manager:** npm with workspaces. Install with `npm ci` from the committed lockfile.
- **App framework:** Expo (React Native), newest stable SDK at repo creation time (SDK 57 was
  current when the Options Pricing Suite pinned; use the latest stable and pin it). One Expo app
  per product under `apps/<app-name>`, TypeScript `strict: true`.
- **Navigation:** Expo Router (file-based, same as headlines).
- **State:** React state + context; add Zustand only if a plan calls for it. No Redux.
- **Local storage:**
  - Small key-value/preferences: `@react-native-async-storage/async-storage`.
  - Structured data (life-admin, shift-life): `expo-sqlite`. Wrap all SQL in a typed DAO module
    under the app's `src/db/`; domain logic never imports the DB directly.
- **Notifications:** `expo-notifications`. Local scheduled notifications for local-first apps;
  Expo Push (via Supabase edge functions) for the quiet-alerts family.
- **Charts/graphics:** `react-native-svg` only. No heavy chart libraries.
- **UI:** plain React Native `StyleSheet` + a small shared `packages/ui` design-tokens module per
  repo (spacing scale, type scale, light/dark palettes). No component-kit dependencies
  (no NativeBase/Tamagui/UI-Kitten).
- **Backend (quiet-alerts only):** Supabase — Postgres + RLS, Edge Functions (Deno), scheduled
  functions/pg_cron, following the headlines repo's `supabase/migrations` + `supabase/functions`
  layout and its RLS conventions.

## 3. Monorepo layout (each repo)

```text
apps/<app-a>/               Expo Router app (one per product)
apps/<app-b>/
packages/domain-<x>/        Dependency-free TypeScript domain logic + Jest tests
packages/ui/                Shared design tokens + primitive components
packages/entitlements/      Pro-unlock seam (§6)
supabase/                   (quiet-alerts repo only) migrations + edge functions
docs/                       Runbooks (push credentials, store submission, data-source notes)
STATUS.md                   Living implementation status + AI continuation instructions
README.md
```

Rules:

- **Domain packages are dependency-free** (no React, no Expo, no fetch). Pure functions in, plain
  data out. This is the same discipline as `packages/pricing-engine` in the Options Pricing Suite
  and is what makes the test suites trustworthy.
- Apps depend on packages; packages never depend on apps; packages may depend on other packages
  only downward (domain ← nothing; ui ← nothing; app ← both).
- Root scripts that must always pass: `npm run typecheck`, `npm run lint`, `npm test`. CI runs all
  three on every PR (GitHub Actions, Node 22, `npm ci`).

## 4. Testing standards

- **Unit tests:** Jest for every domain package. Domain coverage is the priority; UI snapshot
  tests are low-value, use sparingly.
- **Golden regression tests** for anything with financial or safety-relevant math (all four
  calculators; quiet-alerts matching logic). Committed golden files; regeneration only via an
  explicit guarded script (`REGEN_GOLDENS=1 npm run regen-goldens -w packages/<pkg>`), never as a
  side effect of a normal test run. Golden diffs must be reviewed line by line — this is the
  Options Pricing Suite's oracle discipline.
- **Component tests:** `@testing-library/react-native` for critical flows (add item, receive
  notification deep-link, complete onboarding).
- **Edge function tests** (quiet-alerts): matching/dedup logic lives in `packages/domain-alerts`
  and is Jest-tested; edge functions are thin adapters over it.
- **Manual device checklist** per app (in `docs/release-checklist.md`): notification received with
  app killed, deep link opens correct screen, Android reboot re-schedules local notifications,
  airplane-mode behavior, font-scaling at 200%.

## 5. Notifications: engineering rules

- All "should this fire?" logic is a pure function in a domain package:
  `shouldNotify(event, userPrefs, deliveryHistory) -> Decision`. Jest-test it exhaustively.
- **Idempotency:** for server push, a `deliveries` table with `UNIQUE(device_id, event_id)`
  guarantees at-most-once. For local notifications, deterministic notification identifiers
  (`<entity-id>:<milestone>`) so re-scheduling replaces rather than duplicates.
- **Quiet hours:** default 22:00–07:00 local; anything non-urgent scheduled into the next morning.
  Each plan marks which alert types (if any) may break quiet hours (e.g., Tornado Warning: yes;
  ex-dividend date: never).
- **Android:** define named notification channels per alert category at first run.
  **Android reboot:** verify scheduled local notifications survive reboot on a physical device;
  if the Expo SDK version in use does not restore them, implement a headless task/boot receiver
  or re-schedule on next app open and document the gap honestly in-app.
- **iOS:** remote push requires a physical device and an EAS development/preview build; not
  testable in Simulator or Expo Go (same constraint as headlines).

## 6. Entitlements seam (Pro-ready, not Pro-gated)

Every repo has `packages/entitlements`:

```ts
export type Feature = 'core' | /* app-specific flags, e.g. */ 'unlimited-items' | 'export-pdf';
export function hasFeature(feature: Feature): boolean { return true; } // launch: everything free
```

- All feature checks in app code go through `hasFeature()` from day one.
- Each app plan lists which features are candidates for a future Pro unlock. Do **not** implement
  billing, paywalls, or RevenueCat in MVP — the seam is the deliverable.

## 7. Build, release, and store submission

- **EAS Build + Submit.** `eas.json` with `development`, `preview`, `production` profiles per app.
  Monorepo note: each app has its own `eas.json` and project; use `--local` dir context or
  `EAS_PROJECT_ROOT` per app as needed.
- **Identifiers:** `com.dipen.<appname>` (Android applicationId and iOS bundle identifier).
- **Push credentials** (quiet-alerts apps): APNs key + FCM v1 service account per app, following
  the headlines repo's push runbook in its `docs/`.
- **Versioning:** semver in `app.json`; `autoIncrement` build numbers via EAS.
- **Store assets:** each plan's "Store listing" section has the copy. Screenshots: 6.7" iPhone +
  Pixel-class Android minimum. Privacy questionnaires: all apps answer "no data collected" except
  quiet-alerts apps, which declare anonymous identifiers + push tokens ("Data not linked to you").
- **Compliance red lines:** calculators must show "educational, not financial/tax advice"
  disclaimers on first launch and in Settings (see calculators family overview). No app gives
  personalized advice.

## 8. Working agreements for AI agents

1. Work phase by phase per the app plan; acceptance criteria gate each phase.
2. TDD for domain packages: write the Jest spec from the plan's feature table first.
3. Keep `STATUS.md` current every working session — implemented / remaining / how to continue.
4. Conventional commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`).
5. Never commit secrets. `.env.example` documents every env var; Expo public config uses
   `EXPO_PUBLIC_*` exactly as the headlines repo does.
6. Re-verify every external API's terms, auth, and rate limits before coding against it; record
   findings in `docs/data-sources.md` in the repo.
7. When a plan conflicts with reality (API gone, SDK deprecated), stop, document the conflict in
   `STATUS.md`, choose the closest compliant alternative, and note the deviation.
8. Accessibility floor: support OS font scaling to 200% without clipped/overlapping text; minimum
   44×44pt touch targets; meaningful `accessibilityLabel`s on all interactive elements.
9. Adoption & monetization work (store metadata, launch, review prompts, any future paywall)
   follows [01-growth-playbook.md](01-growth-playbook.md) exactly, using the app plan's
   "Adoption & monetization" section as inputs.
