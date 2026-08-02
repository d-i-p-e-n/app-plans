# Accounts & subscriptions (human-only checklist)

Every third-party account the two working repos already depend on, what each one is *for*, and
what breaks without it. This is a **human** checklist: an AI agent must never create these
accounts, accept their terms, enter payment details, or fetch/transcribe their keys.

Scope: `C:\dev\OptionPricer` (Options Pricing Suite) and `C:\dev\headlines` (Only Breaking).
Compiled by reading both repos' `package.json`, `app.config.ts`, `eas.json`, Supabase functions,
and credentials runbooks — not from the plans, which describe intent rather than what is wired.

> Prices were checked 2026-08-02 and change without notice. Re-verify before purchasing.
> Nothing in this file is a secret; it deliberately records *which* accounts exist and *where*
> their artifacts belong, never key material.

---

## 1. At a glance

| Account | OptionPricer | Only Breaking | Cost | Billing |
|---|---|---|---|---|
| GitHub | ✅ | ✅ | Free–$4/user/mo | Monthly |
| Expo / EAS | ✅ | ✅ | Free tier or $19+/mo | Monthly |
| Apple Developer Program | ✅ | ✅ | $99/yr | Annual |
| Google Play Developer | ✅ | ✅ | $25 | One-time |
| Firebase / Google Cloud | ✅ | ✅ | Free (Spark) at this scale | Usage |
| Domain registrar (intellidip.com) | ✅ | — | ~$10–15/yr | Annual |
| Google AdMob | ✅ | — | Free (pays *you*) | — |
| RevenueCat | ✅ | — | Free under $2.5k/mo tracked revenue | Monthly |
| Supabase | — | ✅ | Free or $25/mo Pro | Monthly |
| GNews | — | ✅ | €99.99/mo Business | Monthly |
| Google AI Studio (Gemini API) | — | ✅ | Usage-based, ~$90/mo ceiling | Usage |
| Sentry | — | ✅ | Free tier or $26/mo | Monthly |

**Recurring floor today:** roughly €100 + $99/yr + domain, plus Gemini usage, assuming free tiers
elsewhere. GNews is by far the largest line item and is the one to pressure-test before launch.

---

## 2. Shared by both repos

### GitHub

**Purpose.** Source hosting and CI (GitHub Actions runs typecheck/lint/test on every PR per
shared-standards §3).

**Also becomes the package registry.** Per [02-app-kit.md](02-app-kit.md), `@intellidip/app-kit`
publishes to **GitHub Packages**. That needs a classic PAT with `read:packages` on every dev
machine and in every consuming repo's CI, plus `write:packages` for the publishing workflow.

**Without it:** no CI, and no way to distribute shared scaffolding across repos.

**Cost.** Free covers private repos and Actions minutes at this scale. Team is $4/user/month.

---

### Expo / EAS

**Purpose.** Cloud builds (`eas build`), store submission (`eas submit`), and — critically from
Windows — the **only** way to produce iOS binaries without a Mac.

**Organisation:** `intellidip` (`owner` in OptionPricer's `app.config.ts`).
**Project IDs** are committed in each app's `app.config.ts` `extra.eas.projectId`.

Only Breaking additionally uses **Expo Push** (`expo-notifications`) to deliver alerts. That needs
no separate account, but does need APNs and FCM credentials registered with EAS.

**Without it:** no iOS builds at all from a Windows machine, and no store submissions.

**Cost.** Free tier allows limited concurrent builds with queueing. The $19/month Production plan
buys priority; worth it once you are shipping more than one app.

---

### Apple Developer Program

**Purpose.** iOS distribution. Required even to install a development build on your own device —
Apple requires code signing.

**Bundle identifiers in use:** `com.intellidip.option.pricer`, `com.onlybreaking.app`.

Two derived credentials you generate yourself in App Store Connect:

- **App Store Connect API key** (`.p8`) — lets `eas submit` upload without interactive login.
  Lives at `apps/mobile/credentials/asc-api-key.p8`, referenced from `eas.json`. The matching key
  ID, issuer ID and app ID are in `eas.json` and are environment-specific, not secret.
- **APNs key** — push delivery for Only Breaking. Register with EAS.

**Without it:** no iOS at all — not even a device build for yourself.

**Cost.** $99/year. Lapsing removes your apps from the App Store.

---

### Google Play Developer

**Purpose.** Android distribution.

**Application IDs in use:** `com.dipen.pricer.suite`, `com.onlybreaking.app`.

Derived credential: a **Play service-account key** (JSON), created in Google Cloud Console and
granted access in Play Console's API access settings, so `eas submit` can upload. Lives at
`apps/mobile/credentials/play-service-account.json`.

**Note on Play App Signing.** The Options Pricing Suite hit a real migration problem here — the
existing listing predates App Bundle requirements and needed the original 2013 keystore recovered
via the PEPK flow. See `HOWTO.md` section 6a in that repo before touching signing.

**Without it:** no Android distribution.

**Cost.** $25 one-time, for life.

---

### Firebase / Google Cloud

**Purpose.** Differs by repo:

| | OptionPricer | Only Breaking |
|---|---|---|
| Analytics | ✅ | ✅ |
| Crashlytics | ✅ | ❌ (uses Sentry) |
| Hosting | ✅ (intellidip site) | ❌ |

Produces `google-services.json` (Android) and `GoogleService-Info.plist` (iOS), one pair per app,
downloaded into `apps/mobile/credentials/`. These identify the project and are **not secrets**,
but both repos gitignore them deliberately — re-download rather than hunting for a backup.

Both apps ship with auto-collection **off** (`firebase.json`) and only enable it after consent
resolves. That is a product decision, not a Firebase setting.

**Without it:** analytics and crash reporting silently no-op. Neither app breaks — this is by
design, and the dev logger takes over.

**Cost.** Free (Spark) covers Analytics, Crashlytics and modest Hosting indefinitely.

---

### Domain registrar — intellidip.com

**Purpose.** Backs two URLs the apps link to directly:
`https://intellidip.com/privacy_policy.html` (required by both stores) and
`https://intellidip.com/` (the developer-website link behind the brand mark).

Served by Firebase Hosting (site `intellidip-2b1ed`; see `app-plans/firebase/intellidip/`).

**Without it:** the privacy policy 404s, which is a store-review rejection on both platforms.

**Cost.** ~$10–15/year. **Do not let this lapse** — it is the cheapest line item and the one with
the most disproportionate failure mode.

---

## 3. Options Pricing Suite only

### Google AdMob

**Purpose.** Banner ads — the revenue model for the free tier.

**Publisher ID:** `ca-app-pub-2562768097325770`, with per-platform app IDs in `app.config.ts` and
ad unit IDs in `src/ads/config.ts`.

Also supplies the **UMP consent flow** (EU/UK GDPR + Google's own requirement). Consent messages
are configured in the AdMob console under Privacy & messaging, not in code.

**Requires a payment profile** (AdSense-linked) before it will pay out, and a tax interview.

**Without it:** no ad revenue. The app still runs; banners fail silently.

**Cost.** Free. Note that non-production builds must serve Google's *test* ad units — serving real
ads to yourself in development risks the account.

---

### RevenueCat

**Purpose.** The one-time Remove-Ads purchase, wrapping StoreKit 2 and Play Billing behind one
API and handling restore-across-reinstall.

Needs one API key per platform, supplied as `EXPO_PUBLIC_REVENUECAT_IOS_KEY` and
`EXPO_PUBLIC_REVENUECAT_ANDROID_KEY`. The entitlement identifier is `no-ads`
(`NO_ADS_FEATURE` in code).

Requires connecting **both** store accounts so RevenueCat can validate receipts — App Store
Connect via its API key, Play via the service account.

**Without it:** `isPurchasesConfigured()` returns false and the Remove-Ads row hides itself. The
app degrades cleanly, but there is no way to buy ad removal.

**Cost.** Free below $2,500/month tracked revenue, then 1%.

---

## 4. Only Breaking only

### Supabase

**Purpose.** The entire backend — Postgres with RLS, Edge Functions (`ingest-news`,
`dispatch-alerts`, `review-event`), and pg_cron scheduling.

Ingestion runs every 3 minutes; dispatch every minute.

Server-side secrets are set with `supabase secrets set`, never in Expo env vars. The
**service-role key must never reach the client** — the app uses only the publishable key
(`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`).

**Without it:** the app has no content, no alerts, nothing. This is the hard dependency.

**Cost.** Free tier pauses after a week of inactivity — unusable for a cron-driven pipeline. Pro
at $25/month is effectively required in production.

---

### GNews

**Purpose.** The news source. Seven categories polled every 3 minutes.

**This is the expensive one and the one with a real contractual constraint.** That polling rate is
~100,800 requests/month, which needs the **Business** plan (5,000/day). The Free plan's 100/day
allowance cannot run the seeded schedule at all — `docs/COST_MODEL.md` says to keep the ingest
cron inactive on Free except for controlled testing.

**Verify the contract permits** headline display, caching, notification use, and your polling
rate before launch. That check is in `docs/DEPLOYMENT.md` §1 for a reason.

**Without it:** no articles enter the pipeline.

**Cost.** €99.99/month, or €79.99/month billed annually.

---

### Google AI Studio (Gemini API)

**Purpose.** Article classification and embeddings (for dedup) inside `ingest-news`. Models are
configured by env var, currently `gemini-3.1-flash-lite` and `gemini-embedding-2`.

Billed per token. `docs/COST_MODEL.md` computes a **capacity ceiling** of ~$90/month at the
24-article-per-run cap — a bound, not a forecast. Actual volume is recorded in the `pipeline_runs`
table; query it rather than guessing.

**Without it:** ingestion cannot classify or dedup, so nothing reaches the feed.

**Cost.** Usage-based. Free tier exists but is rate-limited well below production need.

---

### Sentry

**Purpose.** Crash and error monitoring for the mobile app (`@sentry/react-native`). This is Only
Breaking's equivalent of OptionPricer's Crashlytics — the two repos deliberately differ here.

Source-map upload is **disabled in all EAS profiles** today
(`SENTRY_DISABLE_AUTO_UPLOAD: "true"` in `eas.json`), so stack traces will be unsymbolicated until
you add a `SENTRY_AUTH_TOKEN` and turn that off. Worth doing before launch.

**Without it:** no crash visibility. The app runs fine.

**Cost.** Free tier (5k errors/month) is plausibly enough; Team is $26/month.

---

## 5. Not needed yet

Do not create these until a plan actually calls for one:

| Service | Trigger |
|---|---|
| Cloudflare Pages | The `quiet-site` marketing repo in the portfolio README |
| A second Supabase project (EU region) | `quiet-alerts-eu`, which needs EU data residency |
| Apple Search Ads / Google Ads | Paid acquisition — growth playbook, post-launch only |
| A company entity / DUNS | Only if publishing under an organisation rather than as an individual |

---

## 6. Rules for handling any of this

1. **Agents never create accounts, accept terms, enter payment details, or handle key material.**
   If an agent needs a key, it asks you to place the file and tells you where.
2. **Nothing secret is committed.** `apps/mobile/credentials/` is gitignored except its README.
   Server secrets live in `supabase secrets`; build secrets in `eas secret`; local development in
   `.env.local`, which is gitignored. `.env.example` documents variable *names* only.
3. **Public identifiers are fine in the repo** — AdMob publisher/app IDs, EAS project IDs, bundle
   identifiers and Firebase config files are already committed or intentionally local. Only keys,
   tokens and service-account JSON are secret.
4. **Renewal calendar.** Apple ($99/yr) and the domain (~annual) are the two that expire and take
   something down with them. Put both in a calendar with a month of warning.
5. **Rotation.** Replace the file in `credentials/` and revoke the old key at the source (Google
   Cloud Console for Play, App Store Connect for the `.p8`). Both repos' credentials READMEs say
   this too.
