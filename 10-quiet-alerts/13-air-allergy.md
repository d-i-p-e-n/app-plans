# Air & Allergy — Plan

**One sentence:** One ping when air quality or pollen crosses *your* threshold; silence otherwise.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. Reuses the shared backend.

## 1. Product

- **Audience:** households with asthma or COPD, parents of kids with respiratory sensitivity,
  allergy sufferers, runners deciding whether to train outside. Wildfire seasons periodically
  make this app go viral.
- **Gap:** IQAir/PurpleAir/AirNow apps are dashboards — dense maps, upsells, ads — when the actual
  user need is a threshold crossing: "tell me when it's bad *for me*, and when it's clear again."
- **MVP scope decision:** **AQI only.** Pollen is Phase 6 behind a provider evaluation (US pollen
  data has no great free source; Google Maps Platform's Pollen API has a monthly free credit —
  evaluate cost at real usage before committing). Ship AQI; design thresholds UI so pollen slots
  in beside it.

Non-goals: maps, sensor-network browsing, historical charts beyond 7 days, indoor air.

## 2. Data sources

| Source | What | Endpoint | Auth |
|---|---|---|---|
| AirNow | US official AQI observations + forecast by lat/lon | `https://www.airnowapi.org/aq/observation/latLong/current/?...&API_KEY=` | free key (rate limit ~500 req/hr/key — batch by grid cell) |
| Open-Meteo Air Quality | Global PM2.5/O3/US-AQI hourly (fallback + forecast) | `https://air-quality-api.open-meteo.com/v1/air-quality?...` | none (re-verify commercial terms, same caveat as Quiet Weather) |
| Google Pollen API (Phase 6) | Daily pollen indices (tree/grass/weed) | Maps Platform | API key, billed after free credit |

AirNow is the primary (official US AQI, matches what news reports); Open-Meteo fills gaps and
provides forecast for the "clearing tomorrow" copy. Server polls; clients never hold keys.

## 3. Alert logic (`packages/domain-air`)

Per saved place, per device: params `{aqi_threshold: 50|100|150|200, sensitive_mode: bool}`.
Preset labels map to EPA breakpoints: "Sensitive (100+)", "Everyone (150+)", "Health alert
(200+)", plus custom. Rules (all pure, Jest-tested, hysteresis is the whole game):

1. **Crossing up:** current AQI ≥ threshold AND previous stable state was below → notify:
   "Air quality reached 156 (Unhealthy) near {place}. {dominant pollutant}. Forecast: improving
   tomorrow." Include forecast direction whenever available.
2. **Hysteresis:** after an up-crossing, no further up-notifications until AQI falls below
   (threshold − 25) for ≥ 3 consecutive hourly readings (prevents flapping around the line).
3. **All-clear (opt-in, default on):** after an up-crossing episode, notify once when AQI < 
   (threshold − 25) sustained 3 h: "Air is back to Moderate (72) near {place}." The all-clear is
   the emotionally valuable one — people are waiting to open windows / let kids out.
4. **Budget:** hard cap 2 pushes/place/day (episode start + all-clear). Multi-day smoke events:
   no repeat "still bad" pushes; the app shows current status when opened. Never break quiet
   hours (deferred crossings report state as of morning: "Air is Unhealthy this morning (162)").
5. Synthetic events: `source='aqi'`, `external_id='{cell}:{episode_start_iso}'` — one event per
   episode, `deliveries` uniqueness handles the rest; the all-clear is a second event
   `'{cell}:{episode_start_iso}:clear'`.

## 4. Backend

- Subscriptions: `topic_type='aqi_cell'`, `topic_key` = 0.1° grid cell (~11 km — coarse enough
  for privacy, fine enough for AQI), params as above. ≤3 places/device.
- `ingest-airnow`: hourly, distinct subscribed cells, batched within key rate limits; write
  `readings` rows (cell, ts, aqi, pollutant, source) to a family-scoped table (add in this app's
  migration) retained 7 days; episode detection runs on readings + a small `episode_state` table.
- `dispatch`: shared.

## 5. Screens

- `/(onboarding)`: promise → add place (ZIP) → pick threshold with plain-language presets
  (explicitly: "asthma / young kids → Sensitive") → push opt-in.
- `/` **Places:** big number, EPA color, category word, dominant pollutant, sparkline of last
  48 h (react-native-svg), forecast one-liner. All-clear state is calm, not celebratory.
- `/event/[id]`: episode detail — what pollutant, EPA guidance text for the category, link to
  AirNow.gov page.
- `/settings`: thresholds per place, all-clear toggle, quiet hours, sent-log, data attribution
  (AirNow/EPA required attribution), the "never" manifest (no daily AQI digests, no maps, no
  streaks).

## 6. Phases & acceptance criteria

1. **Domain:** episode/hysteresis engine with a golden test suite covering: clean crossing,
   flapping around threshold (must emit exactly 1 push), multi-day smoke event (exactly
   start + clear), threshold change mid-episode, DST boundary. This suite is the app.
2. **Backend:** `ingest-airnow` + episode state machine live locally; rate-limit batching proven
   with 100 fake cells; readings retention job.
3. **App:** full screens; sparkline; offline shows last-known with timestamp.
4. **Push E2E:** physical devices; simulated episode via fixture readings produces exactly
   2 pushes (start, clear); quiet-hours deferral verified.
5. **Release:** EAS, listings, privacy (anonymous ID + coarse grid cell), runbooks.
6. **Pollen (post-launch):** provider evaluation memo in `docs/`, then mirror the same episode
   engine per pollen type with per-type thresholds.

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Air Alerts: AQI & Smoke
- **iOS subtitle:** One ping at your threshold
- **iOS keyword field:** air quality,wildfire,asthma,pollen,allergy,pm2.5,ozone,airnow,breathing,copd,kids,run
- **Play title:** Air Alerts: AQI & Smoke
- **Play short description:** One alert when AQI crosses your line. One when it clears. No dashboards.
- **Keyword targets:** primary "air quality alert", "AQI notification"; long-tail "app that tells me when air is bad for asthma", "wildfire smoke alerts".
- **Play long description — first two lines:** "Air quality apps are dashboards; what you need is a threshold. Air Alerts sends one notification when AQI crosses the line you set — asthma, kids, or training — and one when it clears. Nothing in between."
- **Launch channels:** r/Asthma, r/COPD, r/running and Strava club forums, r/AirPurifiers, parent groups in wildfire-season states (Jul–Oct timing).
- **Review prompt moment:** first app open after an all-clear notification. Excluded: during an active episode.
- **Pro candidates & anchor:** >3 places, per-pollutant thresholds; quiet-alerts Supporter $5.99/yr (playbook §8).
- **Web/SEO queries:** "app that alerts when air quality is bad", "AQI threshold notification app", "wildfire smoke alert app", "when is it safe to run outside air quality".
- **Screenshot story:** threshold presets → lock-screen "reached 156" push → all-clear push → 
  sparkline place card.

## 8. Risks

- AirNow key rate limits with success: batch by cell (many devices share cells), request a
  higher-tier key early, Open-Meteo fallback keeps the product alive if a key is throttled.
- Wildfire virality is a load spike on the shared Supabase project — the family overview's
  sanity aborts and per-function budgets matter most here; load-test dispatch with 50k
  subscriptions against one cell episode before launch season (July–October).
- EPA/AirNow attribution requirements: follow their data-use terms page verbatim in-app.
