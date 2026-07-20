# Shared Standards (binding for every app)

These conventions apply to all five repos and all 15 apps. App plans document only deviations.
They mirror the working patterns of the Options Pricing Suite (`C:\dev\OptionPricer`) and Only
Breaking (`C:\Users\djpatel\Documents\Code\headlines`).

## 1. Product charter (non-negotiable)

1. **No accounts.** No email, no password, no profile. Where push notifications require a server,
   use anonymous device sessions exactly as Only Breaking does (a device row keyed by a locally
   generated UUID + Expo push token; nothing personally identifying).
2. **Ads & analytics — the respectful version.** *(2026-07 policy revision. This supersedes
   any "no ads," "no analytics," "no data collected," "zero third-party SDKs," or
   "zero-network" language in individual app plans, most of which predate the decision.)*
   Every app ships Firebase Analytics + Crashlytics and AdMob **banner** ads under §9's
   placement, consent, and event rules; a one-time Remove-Ads purchase (§6) turns ads off
   forever. Still prohibited: selling or brokering user data, SDKs beyond the §9 stack,
   ad formats beyond §9, and analytics on user *content* (§9.3).
3. **App data local by default.** User content (entries, photos, records) leaves the device
   only when a feature is impossible without it (push matching). Usage/crash telemetry (§9)
   is the deliberate, disclosed exception. Calculators and life-admin apps must still
   function fully in airplane mode — ads and analytics degrade silently; features never do.
4. **Minimal permissions.** No GPS unless the app is unusable without it — prefer manually entered
   location (ZIP code / city picker), mirroring Only Breaking's manually selected home state. No
   contacts access except Big Buttons' call sheet (explicitly user-initiated). Camera only for
   apps that photograph receipts/rooms/barcodes.
5. **Quiet notifications.** Every push must pass the test: *"Would the user thank us for this
   interruption?"* Each app plan defines an explicit notification budget. Never send marketing,
   streaks, re-engagement, or digest-that-could-wait pushes. Respect OS notification channels
   (Android) and interruption levels (iOS) so users can tune without leaving the app.
6. **Free with ads at launch; one purchase removes them.** The Remove-Ads IAP ($2.99–$4.99
   one-time) ships in the MVP through the entitlements seam (§6) — billing is a launch
   requirement now, not a deferred seam. Future Pro feature unlocks ride the same seam.
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
- **Analytics/crash:** `@react-native-firebase/app` + `analytics` + `crashlytics` via Expo
  config plugins (development builds required — already the family norm).
- **Ads:** `react-native-google-mobile-ads` (AdMob), including the bundled Google UMP
  consent flow. Banner formats only (§9).
- **Billing:** RevenueCat (default; bare StoreKit 2 / Play Billing acceptable) for the
  Remove-Ads IAP, shipped at launch.
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

## 6. Entitlements seam (Remove-Ads live at launch; Pro-ready)

Every repo has `packages/entitlements`:

```ts
export type Feature = 'no-ads' | 'core' | /* app-specific, e.g. */ 'unlimited-items' | 'export-pdf';
export function hasFeature(feature: Feature): boolean; // 'no-ads' backed by the real purchase;
                                                       // everything else true at launch
```

- All feature checks in app code go through `hasFeature()` from day one.
- `'no-ads'` is backed by the Remove-Ads IAP from the MVP onward (billing per §2); purchase
  state restores across reinstall via the store's native restore path, and every ad slot in
  the app checks it — a purchaser never sees an ad surface again, including house ads.
- Each app plan lists candidates for a *future* Pro feature unlock; those stay free at launch
  and ride the same seam when/if flipped (playbook §8).

## 7. Build, release, and store submission

- **EAS Build + Submit.** `eas.json` with `development`, `preview`, `production` profiles per app.
  Monorepo note: each app has its own `eas.json` and project; use `--local` dir context or
  `EAS_PROJECT_ROOT` per app as needed.
- **Identifiers:** `com.dipen.<appname>` (Android applicationId and iOS bundle identifier).
- **Push credentials** (quiet-alerts apps): APNs key + FCM v1 service account per app, following
  the headlines repo's push runbook in its `docs/`.
- **Versioning:** semver in `app.json`; `autoIncrement` build numbers via EAS.
- **Store assets:** each plan's "Adoption & monetization" section has the copy drafts —
  regenerate them under current policy at submission (older drafts predate the ads decision;
  §9.5). Screenshots: 6.7" iPhone + Pixel-class Android minimum. Privacy questionnaires:
  every app now declares Identifiers (device/advertising IDs), Usage Data, Diagnostics, and
  third-party-advertising collection per the current Apple/Google taxonomies — "no data
  collected" claims are retired portfolio-wide; quiet-alerts apps additionally declare push
  tokens. iOS ships the App Tracking Transparency usage string (§9.2).
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

## 9. Ads, analytics & consent standard (binding; supersedes older per-plan claims)

### 9.1 Ad placement rules
- **Formats:** adaptive anchored banners only. No interstitials, no rewarded, no app-open,
  no native-in-feed formats — the model is banners + Remove-Ads IAP, portfolio-wide.
- **Allowed surfaces:** list/history/stats/results screens, settings. Anchored bottom, never
  adjacent to primary action buttons (accidental-click farming violates both our standards
  and AdMob policy).
- **Ad-free surfaces (placement rule, not an app exemption):** onboarding, capture/entry
  flows (the <15–20 s bars), live workout logging, and crisis/safety surfaces — active
  recall/breach/shortage detail, ER/med-list displays, and Big Buttons' elder-facing
  screens (banners live in its Setup Mode instead; elder misclick risk is an AdMob-policy
  and dignity issue). Each plan's implementation names its surfaces in
  `docs/ad-placements.md`.
- Ads render only after consent resolution (§9.2) and never for `'no-ads'` purchasers (§6).
  Ad slots collapse cleanly offline — no placeholder boxes.

### 9.2 Consent (full stack)
- **Google UMP** flow runs before the first ad request: GDPR consent for EEA/UK users,
  US-state privacy signals as configured in the AdMob console. Personalized ads only with
  consent; non-personalized otherwise. Consent is revisitable via Settings → "Privacy &
  Ads."
- **iOS ATT:** pre-prompt explainer in our voice, then the system prompt; declined =
  non-personalized ads, never nagged again.
- Firebase consent-mode signals follow the same choices. The 60-eu overview's "never add a
  CMP" line is repealed by this section; its Art. 27/GDPR obligations for EU operation now
  apply to *every* app's telemetry, not just the quiet-alerts backend — revisit
  `60-eu/00-eu-overview.md` §3.1 before any EU release.

### 9.3 Analytics & Crashlytics rules
- Screen-view tracking plus a small custom-event taxonomy per app, documented in the repo's
  `docs/analytics-events.md` *before* implementation (event name, params, question it
  answers). If an event answers no decision, it isn't logged.
- **Never log user content as events or params:** no amounts, balances, tickers, medication
  or symptom names, grant values, debts, cycle data, document labels. Coarse buckets are
  fine (`scenario_count: 3`, `items_bucket: "10-25"`). This is the content/usage wall that
  keeps §1.3 honest.
- Crashlytics with default PII scrubbing; no custom keys containing user content.
- Privacy pages rewrite to disclose all of this plainly, including how to opt out (consent
  settings) and what deletion means (Firebase retention settings documented per repo).

### 9.4 Operational requirements
- `app-ads.txt` published on the umbrella domain (playbook §6) before any ad-carrying
  release; AdMob seller verification completed.
- Dev/test: registered test-device IDs + test ad units only; never click live ads in any
  environment you touch.
- Firebase: one project per app (clean privacy labels and data separation); config files
  (`google-services.json` / `GoogleService-Info.plist`) are non-secret config committed to
  the private repo.

### 9.5 Copy honesty (release gate)
Store metadata, privacy pages, and in-app "never" manifests must accurately describe the
ads and telemetry. Any surviving "no ads / ad-free / no analytics / no data collected /
nothing to hand over / zero-network" claim from pre-revision plan drafts is a release
blocker until regenerated. Claims that remain true — no accounts, no subscriptions, no
bank linking, no data selling, quiet notifications — keep leading the positioning
(playbook §1).
