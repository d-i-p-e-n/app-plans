# Streaming Arrivals — Plan

**One sentence:** Add shows and movies to a list; get one push when a title becomes watchable on a
service you already pay for.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. Reuses the shared backend. **Build last in
the family** — it has the most licensing risk (§8) and benefits from the pipeline being mature.

## 1. Product

- **Audience:** anyone who has thought "I'll watch that when it hits something I have" and then
  forgot. Households juggling 3–5 subscriptions.
- **Gap:** JustWatch does availability lookup but is a cluttered, ad-driven discovery engine.
  Nobody ships the quiet inverse: a watchlist that stays silent until availability *changes in
  your favor*, then tells you once.
- **The pitch is the usage pattern:** add 20 titles, forget the app exists, get ~2 pushes a month.

Non-goals: recommendations, trailers, reviews/ratings display beyond basic metadata, social
features, deep links that launch playback (nice-to-have Phase 6; app-store deep-link schemes are
brittle), tracking what you've watched (it's an arrivals list, not a tracker — "watched" just
archives the item).

## 2. Data sources & licensing (read §8 before building)

| Source | What | Notes |
|---|---|---|
| TMDB API | Title search, metadata, posters, and **watch providers** (`/movie/{id}/watch/providers`, `/tv/{id}/watch/providers`) | Free API key. Provider data is **supplied by JustWatch** — TMDB requires visible attribution to both TMDB and JustWatch, and prohibits some commercial uses without a license. The app is free at launch which helps, but **get written clarity from TMDB before store release** (§8). |
| Streaming Availability API (Movie of the Night) | Alternative availability data w/ change endpoints | RapidAPI; free tier small, paid tiers cheap. Fallback/replacement if TMDB terms don't work. |

Same abstraction rule as Holdings Calendar: `packages/provider-streaming` with an
`AvailabilityProvider` interface; TMDB implementation first, MOTN implementation stubbed.

Provider/service model: TMDB watch-provider IDs (Netflix=8, etc.) → a curated `services` table
(US services at launch: Netflix, Prime Video, Disney+, Hulu, Max, Apple TV+, Paramount+, Peacock,
plus free tiers Tubi/Pluto/Freevee-class). Monetization types tracked: `flatrate` (subscription),
`free`/`ads`. **`rent`/`buy` never notify** (that's an ad for spending money, not an arrival).

## 3. Alert logic (`packages/domain-streaming`)

User state: list of titles (TMDB ids) + set of services they pay for + per-title done/archived.

1. **Arrival:** title's provider set (flatrate/free) gains a service in the user's set → push:
   "The Bear is now on Hulu." One push per (device, title, service). `external_id=
   '{tmdb_id}:{service_id}:{first_seen_date}'`.
2. **Leaving soon (Phase 6, off by default):** only if a provider exposes reliable expiry data —
   do not fake it with scraped "leaving this month" lists.
3. **New season (TV, on by default):** subscribed show gets a new season available on user's
   service → same arrival mechanics keyed by season number.
4. **Budget:** batch same-day arrivals into one push ("2 from your list arrived: The Bear (Hulu),
   Dune (Max)"); max 1 push/day; never break quiet hours; deliver 18:00–20:00 local (when people
   plan evening viewing) — this is the one app where delivery-time optimization is user-aligned.

## 4. Backend

- Subscriptions: `topic_type='title'`, `topic_key='{tmdb_type}:{tmdb_id}'`, params
  `{services:[8,15,...], notify_seasons:bool}`. Cap 100 titles/device
  (`hasFeature('unlimited-items')` seam).
- `ingest-availability`: daily, iterate **distinct subscribed titles** (thousands at most),
  fetch watch providers, diff against stored provider-set snapshot per title (`title_state`
  table added in this app's migration), emit arrival events on adds. TMDB rate limits are
  generous (~50 rps burst) — throttle to be polite, cache posters via TMDB CDN URLs (do not
  rehost images).
- Title search happens **client → our edge function → TMDB** (key stays server-side), thin
  proxy with 24h cache on popular queries.
- `dispatch`: shared, with the 18:00–20:00 local delivery window logic in `domain-streaming`.

## 5. Screens

- `/(onboarding)`: promise ("~2 notifications a month. No recommendations. Ever.") → pick your
  services (logo grid) → add first titles (search) → push opt-in.
- `/` **My List:** two sections — *Watchable now* (on your services, with service badge) and
  *Waiting* (with "currently: rent only / not streaming" status). Archive swipe. Poster, year,
  type. Empty state: "Add anything. We'll wait."
- `/search`: TMDB search via proxy; add button; shows current availability inline so users don't
  add things they could watch tonight without noticing.
- `/event/[id]`: arrival detail — title, service, season if applicable, "open {service}" link
  (app scheme if trivially known, else store page), attribution footer.
- `/settings`: services editor, standard family settings, **TMDB + JustWatch attribution**
  (mandatory, visible, not buried), the "never" manifest (no recommendations, no rent/buy pushes,
  no engagement digests).

## 6. Phases & acceptance criteria

1. **Licensing checkpoint (blocking):** written confirmation of TMDB provider-data usage for a
   free consumer app, or pivot decision to MOTN paid tier recorded in `docs/data-sources.md`.
   Do not pass this phase silently.
2. **Provider layer:** interface + TMDB impl + fixtures; diff engine golden tests: add/remove
   service, season adds, free-tier vs rent transitions, region assumptions (US-only launch).
3. **Backend:** ingest + `title_state` diffing at scale (fixture set of 1k titles), search proxy
   with cache.
4. **App:** onboarding, list, search, detail; poster caching; archive flow.
5. **Push E2E:** arrival fixture → single batched push in evening window on physical devices;
   idempotency on re-runs.
6. **Release:** EAS, listings, privacy questionnaire (anonymous ID + title list, "not linked"),
   runbooks.

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle. **No streaming-service
trademarks in the iOS keyword field or either title** (playbook §1); services may be named
descriptively in the long description.

- **iOS name:** Arrivals: Streaming Alerts
- **iOS subtitle:** One ping when it's watchable
- **iOS keyword field:** watchlist,where to watch,movies,tv,shows,tracker,new,tonight,films,series,list
- **Play title:** Arrivals: Streaming Alerts
- **Play short description:** Add shows to a list. One ping when they hit a service you already pay for.
- **Keyword targets:** primary "streaming watchlist", "where to watch"; long-tail "app that notifies when movie comes to streaming".
- **Play long description — first two lines:** "\"I'll watch it when it hits something I have\" — then you forget. Arrivals remembers: add any show or movie, pick the services you pay for (Netflix, Hulu, Max, and the rest), and get one evening ping when something on your list becomes watchable."
- **Screenshot story:** add title (rent-only status) → months pass (calendar art) → single push "now on your services" → watchable-now list.
- **Launch channels:** r/cordcutters, r/television, r/MovieSuggestions; strong short-video potential (the add-and-forget demo is 15 seconds).
- **Review prompt moment:** after archiving ("watched") a title that arrived via push (full loop completed). Excluded: first session.
- **Pro candidates & anchor:** >100 titles, leaving-soon alerts (Phase 6); Supporter $5.99/yr — real licensing costs if the MOTN fallback is used (§8).
- **Web/SEO queries:** "app that notifies when a movie comes to streaming", "watchlist alerts for streaming services", "quiet justwatch alternative", "when will it be streaming tracker".

## 8. Licensing risk (the reason this ships last)

TMDB's watch-provider data is licensed from JustWatch and carries usage conditions beyond TMDB's
own API terms; enforcement history exists against apps that rebadge JustWatch data. Mitigations,
in order: (1) free app, prominent dual attribution, no data rehosting; (2) written OK from TMDB;
(3) budget MOTN paid tier (~$25–100/mo class) as the compliant fallback; (4) if neither works,
this product is shelved — do not ship on scraped data. The other four family apps are unaffected.
