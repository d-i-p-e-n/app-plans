# Quiet Weather — Plan

**One sentence:** Weather notifications only when the weather requires something of you.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. Reuses the shared backend built by
Recall Watch.

## 1. Product

- **Audience:** everyone who has muted their weather app. Secondary personas with specific
  trigger needs: gardeners (freeze), bike/walk commuters (rain in the next hour), parents
  (heat advisories, school-morning cold), homeowners (wind, hail).
- **Gap:** incumbent weather apps monetize opens, so they spam ("SPECIAL WEATHER STATEMENT",
  daily forecasts, ads between alerts). NWS data is free and authoritative; nobody ships a
  filter-first client.
- **Scope decision:** **US-only at launch** (NWS). International via Open-Meteo warnings is a
  later phase; do not architect it out, but do not build it in MVP.

Non-goals: being a forecast app. There is a minimal "today + 3 days" glance screen so the app
isn't useless when opened, but the product is the alert filter, not the forecast. No radar, no
maps, no widgets in MVP.

## 2. Data sources

| Source | What | Endpoint | Auth |
|---|---|---|---|
| NWS API | Active CAP alerts by zone | `https://api.weather.gov/alerts/active?zone={zoneId}` | none; **required** `User-Agent` header with contact email |
| NWS API | Point → forecast zone/county | `https://api.weather.gov/points/{lat},{lon}` | none |
| NWS API | Gridpoint hourly forecast | from `points` response `forecastHourly` | none |
| Open-Meteo | 15-minutely precipitation (rain-soon) & daily lows (freeze) | `https://api.open-meteo.com/v1/forecast?minutely_15=precipitation&...` | none; free tier is non-commercial — re-verify licensing before launch, budget for their paid API tier if needed |

Location: user types a ZIP/city (client geocodes via the NWS points endpoint using a small
committed ZIP→lat/lon dataset, or `expo-location` **only if the user explicitly opts into**
"use my location once to set this up" — never background location). Server stores only the
NWS zone/county IDs and a rounded lat/lon grid cell (2 decimal places max).

## 3. Alert taxonomy (the product core)

`packages/domain-weather` defines a curated rule table mapping NWS event types × user-enabled
concerns → notify/ignore. Committed as data + tested. Initial policy:

**Always on (cannot be disabled, may break quiet hours):**
Tornado Warning, Flash Flood Warning, Severe Thunderstorm Warning (destructive tag),
Extreme Wind Warning, Tsunami Warning, Evacuation Immediate.

**Opt-in concern packs (checkbox onboarding, each maps to specific event types/derived rules):**
- *Freeze & frost* (gardeners): Freeze Warning, Frost Advisory + derived "first freeze of season
  tonight" from forecast lows.
- *Rain soon* (commuters): derived from 15-minutely precip — "Rain likely at your location within
  ~45 min" only inside a user-set daily time window (e.g. commute hours), max 1/day.
- *Heat*: Excessive Heat Warning/Heat Advisory.
- *Winter*: Winter Storm Warning, Ice Storm Warning, Blizzard Warning (Watches optional toggle).
- *Wind & hail*: High Wind Warning, damaging-hail-tagged severe storms.
- *Air-adjacent* (dense smoke): Dense Smoke Advisory (full AQI belongs to Air & Allergy app; the
  detail screen cross-promotes it).

**Never notified, ever:** Special Weather Statements, generic Watches (unless toggled), daily
forecasts, "weather story" content. Document this list in-app on the settings screen — the
refusal is the brand.

Dedupe rule: one push per (NWS alert id); upgrades (Watch→Warning where watches enabled) re-notify
with "upgraded". Expiry/cancellation never notifies (feed-only status change).

## 4. Backend

- Subscriptions: `topic_type='nws_zone'` (forecast zone + county zone rows per saved place, ≤3
  places per device), `topic_type='derived'` for rain-soon/freeze with params
  `{grid_cell, window_start, window_end}`.
- `ingest-nws`: every 5 min, fetch active alerts for the distinct set of subscribed zones
  (batched; NWS allows reasonable polling with UA header — cache `Last-Modified`). Normalize CAP
  → events with `match_keys=['nws_zone:{zone}']`, severity from CAP severity/certainty/urgency.
- `derive-precip`: every 15 min **during any device's active window only**, query Open-Meteo for
  distinct grid cells, emit synthetic events (`source='derived-rain'`,
  external_id=`{cell}:{date}`) — the unique constraint gives the 1/day cap for free.
- `derive-freeze`: daily 16:00 local per timezone cohort; forecast low ≤ 0°C within 36h → synthetic
  event per cell per cold snap (external_id includes snap start date, not calendar date, so a
  4-night freeze is one notification).
- `dispatch`: shared. Life-safety class breaks quiet hours; everything else defers to morning.

## 5. Screens

- `/(onboarding)`: promise screen ("No daily forecasts. No 'weather stories.' Only warnings and
  the concerns you pick.") → add place (ZIP) → concern packs → push opt-in.
- `/` **Places**: card per saved place: current temp + today/tonight one-liner (NWS gridpoint,
  fetched client-side on open, cached 30 min) + any active alerts. All-clear state: "Nothing
  needs your attention."
- `/event/[id]`: alert detail — what/where/until when, NWS instruction text verbatim, link to
  full NWS alert page.
- `/concerns`: the rule table as UI — every toggle shows exactly which NWS products it maps to.
- `/settings`: standard family settings + the "what we will never notify you about" manifest.

## 6. Phases & acceptance criteria

1. **Domain:** rule table + CAP normalizer + dedupe/upgrade logic in `packages/domain-weather`;
   golden corpus of ~100 real CAP alerts (fixtures) with expected decisions; all green.
2. **Backend:** `ingest-nws` + both derive functions live locally with `ingest_runs` health rows;
   zone-set batching proven (N places → ≤ N zone queries per cycle, deduped across devices).
3. **App:** onboarding, places (≤3), concerns, feed, detail, settings; NWS `points` resolution
   from ZIP working offline-tolerantly (clear error when NWS is down).
4. **Push E2E:** physical devices; a Tornado Warning fixture breaks quiet hours, a Frost Advisory
   fixture defers to morning; upgrade re-notification proven.
5. **Release:** EAS builds, store listings, privacy questionnaire (anonymous ID, coarse zone
   only), runbooks.

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Quiet Weather: Severe Alerts
- **iOS subtitle:** Warnings only. No daily spam
- **iOS keyword field:** storm,tornado,freeze,frost,rain,wind,hail,winter,heat,nws,warning,notification,forecast
- **Play title:** Quiet Weather: Severe Alerts
- **Play short description:** Severe weather warnings only. No daily forecasts, no ads, no spam. NWS data.
- **Keyword targets:** primary "severe weather alerts", "weather warnings app"; long-tail "weather app without notification spam", "freeze warning alerts".
- **Play long description — first two lines:** "You muted your weather app for a reason. Quiet Weather sends National Weather Service warnings and the specific concerns you pick — freeze for your garden, rain before your commute — and nothing else, ever."
- **Screenshot story:** muted-competitor pain frame → concern packs → single lock-screen warning → the "what we'll never send you" manifest shot (playbook §3).
- **Launch channels:** r/gardening (freeze pack), r/bikecommuting (rain-soon), r/preparedness, Show HN (filter-first architecture story), local-news weather-fatigue threads.
- **Review prompt moment:** first calm-day app open after the app's first delivered warning. Excluded: during any active alert.
- **Pro candidates & anchor:** >3 places, custom rule packs; quiet-alerts Supporter $5.99/yr (playbook §8).
- **Web/SEO queries:** "weather app that only sends severe alerts", "weather app without daily notifications", "freeze warning alert app for gardeners", "rain alert before commute app".

## 8. Risks

- NWS API outages are routine — feed staleness indicator in-app ("data as of 12:04"), never
  fabricate all-clear; if polling fails >30 min, banner in app, no push.
- Open-Meteo commercial licensing must be re-verified; if unusable, rain-soon ships later using
  NWS gridpoint hourly PoP (coarser: "rain likely this morning" at window start).
- Alert fatigue creep is the product risk: any new notification type requires updating the
  in-app "never" manifest and the rule-table tests — make the manifest a rendered view of the
  actual rule table so it cannot lie.
