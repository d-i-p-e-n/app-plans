# Quiet Alerts Family — Overview

One monorepo (`quiet-alerts`), eight apps, **one shared Supabase project**. Every app is the same
shape: *authoritative data feed → server-side ingestion → aggressive per-user filtering → rare,
high-value push → deep link to detail*. This generalizes the Only Breaking pipeline; when in doubt
about a pattern (anonymous devices, RLS, scheduled functions, push dispatch, retention), copy the
headlines repo's approach.

Apps: Recall Watch, Quiet Weather, Air & Allergy, Holdings Calendar, Streaming Arrivals,
Breach Watch, Quake Watch, Shortage Watch (note: Shortage Watch deliberately deviates from the
server-side matching pattern — its plan's §3 explains the on-device-matching architecture).

## Monorepo layout

```text
apps/recall-watch/
apps/quiet-weather/
apps/air-allergy/
apps/holdings-calendar/
apps/streaming-arrivals/
apps/breach-watch/
apps/quake-watch/
apps/shortage-watch/
packages/domain-alerts/      Shared: matching, dedupe, quiet hours, notification decisions
packages/domain-<app>/       Per-app domain logic (e.g., recall matching, AQI thresholds)
packages/api-client/         Typed client for the Supabase REST/RPC surface used by apps
@intellidip/app-kit           Published shared scaffolding (theme, text scale, splash,
                              brand mark, About, analytics/crashlytics, entitlements,
                              ads/purchases config) - see 02-app-kit.md. NOT a workspace
                              package; add it to each app's dependencies.
supabase/migrations/
supabase/functions/
docs/
```

## Shared backend (single Supabase project)

All eight apps share one project; every row carries an `app_id` discriminator
(`recall_watch | quiet_weather | air_allergy | holdings_calendar | streaming_arrivals |
breach_watch | quake_watch | shortage_watch`). One
project keeps cost near zero at launch and lets the family share ingestion infrastructure. If any
single app's load ever justifies it, it can be split out later — the `app_id` column makes that a
data migration, not a redesign.

### Core schema (migration 0001)

```sql
-- Anonymous device sessions (mirror Only Breaking: no accounts, no PII)
create table devices (
  id uuid primary key default gen_random_uuid(),
  app_id text not null,
  device_secret_hash text not null,        -- client-generated secret, hashed; auths device-scoped RPCs
  expo_push_token text,
  platform text check (platform in ('ios','android')),
  push_enabled boolean not null default false,   -- default OFF, same as headlines
  timezone text not null default 'America/New_York',
  quiet_hours int4range not null default '[22,7)'::int4range,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now()
);

-- What a device wants to be alerted about. topic_type/topic_key are app-defined.
create table subscriptions (
  id uuid primary key default gen_random_uuid(),
  device_id uuid not null references devices(id) on delete cascade,
  app_id text not null,
  topic_type text not null,     -- e.g. 'vin', 'upc', 'category', 'nws_zone', 'ticker', 'tmdb_id'
  topic_key text not null,
  params jsonb not null default '{}',   -- thresholds, flags (e.g. {"aqi_threshold":100})
  created_at timestamptz not null default now(),
  unique (device_id, topic_type, topic_key)
);

-- Canonical events after ingestion + dedupe.
create table events (
  id uuid primary key default gen_random_uuid(),
  app_id text not null,
  source text not null,                 -- 'cpsc', 'nws', 'airnow', ...
  external_id text not null,            -- source's stable id
  kind text not null,                   -- app-defined event kind
  severity text,                        -- app-defined ordinal
  title text not null,
  url text,                             -- canonical link to the authoritative source
  match_keys text[] not null default '{}',  -- precomputed keys joined against subscriptions
  payload jsonb not null default '{}',
  first_seen_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source, external_id)
);
create index on events using gin (match_keys);

-- At-most-once delivery ledger.
create table deliveries (
  id bigint generated always as identity primary key,
  device_id uuid not null references devices(id) on delete cascade,
  event_id uuid not null references events(id) on delete cascade,
  sent_at timestamptz not null default now(),
  receipt_status text,
  unique (device_id, event_id)
);
```

### RLS model

Same philosophy as headlines: the anon key can do almost nothing directly. Devices authenticate
device-scoped operations through RPCs that check `device_secret_hash`. `events` is readable
(public data), `devices`/`subscriptions`/`deliveries` are accessible only via `security definer`
RPCs (`register_device`, `upsert_subscription`, `delete_subscription`, `list_my_subscriptions`,
`my_feed`). No table is writable by anon directly.

### Edge functions

- `ingest-<source>` — one per data source, on a schedule (pg_cron / scheduled functions).
  Fetch, normalize to `events`, compute `match_keys`, upsert on `(source, external_id)`.
- `dispatch` — runs after ingestion; joins new/updated events' `match_keys` against
  `subscriptions`, applies `packages/domain-alerts` decision logic (thresholds, quiet hours per
  device timezone, dedupe against `deliveries`), sends Expo push in batches of 100, records
  deliveries, checks receipts on a follow-up schedule and prunes dead tokens.
- Retention: raw source payloads live ≤30 days (headlines convention); canonical `events` rows
  kept while any subscription references their match keys, else pruned at 180 days.

**All matching and decision logic lives in `packages/domain-alerts` (pure TS, Jest-tested);
edge functions import it and stay thin.** Supabase functions run Deno — keep the domain package
free of Node-specific APIs so it loads in both Jest (Node) and edge (Deno) contexts.

## Shared client patterns (all five apps)

- **Onboarding:** ≤3 screens. (1) What the app does and does not do — state the notification
  budget out loud ("most users get 1–3 notifications a month"); (2) add first subscription;
  (3) optional: enable push (OS prompt only after explaining; push defaults off server-side until
  token registered). No account, ever.
- **Home screen:** the user's subscriptions + a reverse-chron feed of events that matched them.
  Empty state: "Nothing needs your attention." — that sentence is the product.
- **Deep links:** every push opens the matching event detail via Expo Router route
  `/<event-id>`; detail screen links out to the authoritative source (recall notice, NWS alert,
  SEC/company IR page, etc.). We summarize; the source is the record.
- **Notification settings screen:** per-topic toggles, quiet hours editor, per-category Android
  channels, a "test notification" button, and a plain-language log of the last 20 notifications
  sent (from `deliveries` via RPC) — transparency is a feature.
- **Pro-candidate features** (behind `hasFeature`, all free at launch): subscription-count caps
  lifted, household/multi-device sync via share codes, CSV export.

## Family-wide implementation order

Build **Recall Watch first** — it forces the whole pipeline (schema, RPCs, ingest, dispatch,
push credentials, one app shell). Each subsequent app then adds: one or two `ingest-*` functions,
one `domain-<app>` package, and one `apps/<app>` shell reusing `@intellidip/app-kit` +
`api-client`.
Target: each app after the first should be a materially smaller effort than the first.

## Family-wide risks

- **Expo push token churn** — handle `DeviceNotRegistered` receipts by disabling push on the
  device row (headlines does this; copy it).
- **Source feed instability** — every `ingest-*` function must fail loudly to a `ingest_runs`
  log table (started/finished/error/row counts) and the repo's `docs/` must include a "how to
  check ingestion health" runbook. A quiet-alerts app that silently stops ingesting is worse
  than no app.
- **Single Supabase project blast radius** — a runaway ingest for one app can exhaust the shared
  project's quota. Per-function timeouts and row-count sanity checks (abort if a source suddenly
  returns 10× normal volume) are mandatory.
