# Quake Watch — Plan

**One sentence:** One push when an earthquake above your threshold happens near a place you care
about — usually where family lives — with USGS facts and a link, nothing else.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Reuses the shared backend; this is
the **cheapest app in the family to add** (one free global feed, trivial matching) and a good
demonstration of the pipeline's leverage.

## 1. Product

- **Audience:** the diaspora/distance use case — people with family or property in seismic
  zones (California, PNW, Mexico, Japan, Philippines, Turkey, Chile…). The moment this serves:
  news says "quake near Manila" → is that near mom? Also: people in seismic zones who want
  aftershock awareness without a cluttered map app.
- **Gap:** quake apps are either early-warning systems (MyShake/ShakeAlert — a different job we
  must never claim) or seismology-hobbyist map dashboards. "Tell me when it shakes near people
  I love, at a magnitude that matters" is unserved.
- **What we are not (say it in onboarding and settings, verbatim):** "This is not an early
  warning system. Notifications arrive minutes after an earthquake. For seconds-before warnings
  where available, install your region's official app (MyShake in California, etc.)." Honesty
  here is a legal and moral requirement, not copy polish.

Non-goals: early warning, shake maps/visualization beyond a static distance line, prediction
(does not exist; never imply it), tsunami warnings (link tsunami.gov statements in detail view
when USGS flags them; we are not a warning authority), volcano/other hazards.

## 2. Data source

| Source | What | Endpoint | Auth |
|---|---|---|---|
| USGS FDSN Event API | Global earthquake catalog (NEIC), near-real-time | `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=...&minmagnitude=4.0` | none |
| USGS GeoJSON feeds | Rolling summaries (hour/day) | `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/4.5_hour.geojson` | none |

Free, authoritative, global. Poll every 5 minutes (feeds are designed for this; honor
`If-Modified-Since`). Event pages (`properties.url`) are the canonical deep-link target; PAGER
impact and "Did You Feel It?" links come along in the payload for the detail screen.

## 3. Alert logic (`packages/domain-quake`)

Subscriptions: `topic_type='geo_cell'`, `topic_key` = lat/lon rounded to 0.1° (~11 km — same
privacy posture as Air Alerts), params `{radius_km: 25|50|100|250, min_magnitude: 4.5|5.5|6.5,
label}`. Places entered by city search against a bundled geonames-subset dataset (no GPS;
manual entry is the family pattern). ≤5 places/device.

Rules (pure, golden-tested with historical USGS fixtures):
1. **Match:** magnitude ≥ threshold AND haversine distance(epicenter, place) ≤ radius. Big-event
   override: M7.0+ within 2× radius also matches (a great quake 180 km away matters even with a
   100 km setting).
2. **Push copy (facts, then reassurance path):** "M5.8 earthquake 34 km from {label}
   ({region name}), 12 km deep, 8:14 pm local time." Detail screen leads with the USGS link and
   a plain note: "Cell networks are usually fine after moderate quakes — a text often gets
   through when a call won't."
3. **Magnitude revisions:** USGS revises magnitudes; re-notify only when a revision newly
   crosses the user threshold upward by ≥0.3 — otherwise silent feed update. (`external_id` =
   USGS event id; revision handling in the decision layer.)
4. **Aftershock damping:** after any matched M6.0+, subsequent matches for the same place
   collapse into at most one summary push per 6 h ("4 aftershocks M4.5+ near {label} in the
   last 6 hours; largest M5.1"). The mainshock is the news; we must not become a buzzing
   anxiety machine during a sequence.
5. Quiet hours: M6.5+ within radius may break them; everything else defers (a distant M4.8 at
   3 a.m. helps no one).

## 4. Screens

- `/(onboarding)`: the not-early-warning disclosure (§1) → add first place (city search) →
  threshold preset in plain language ("Significant only (5.5+) — recommended" / "Notable (4.5+)"
  / "Major (6.5+)") → push opt-in.
- `/` **Places:** card per place: label, "quiet — no recent quakes above your threshold" or the
  latest matched event; last-checked timestamp.
- `/event/[id]`: magnitude/depth/distance/local time, static distance line (place ↔ epicenter,
  react-native-svg — not a map tile dependency), USGS event + PAGER + DYFI links, tsunami.gov
  link when flagged, the reassurance note.
- `/feed`: matched events for your places, reverse-chron.
- `/settings`: family standard + the disclosure again + data attribution (USGS).

## 5. Phases & acceptance criteria

1. **Domain:** matching, revision, damping logic against a fixture set built from real USGS
   history (include the 2019 Ridgecrest sequence as the aftershock-damping test — the golden
   corpus must show ≤5 pushes across the entire first 48 h for a 100 km subscriber).
2. **Backend:** `ingest-usgs` on 5-min schedule with `ingest_runs` health rows; feed-vs-query
   fallback logic.
3. **App:** onboarding with disclosure, places, detail with distance line, feed.
4. **Push E2E:** fixture M5.8 → single push on physical devices; revision crossing → exactly one
   re-notify; damping verified; M6.5 breaks quiet hours, M4.8 defers.
5. **Release:** EAS, listing (§6), privacy (anonymous ID + coarse cells), runbooks.

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Quake Watch
- **iOS subtitle:** Earthquake alerts, your places
- **iOS keyword field:** usgs,seismic,aftershock,tremor,magnitude,monitor,family,safety,notify,epicenter
- **Play title:** Quake Watch: Quake Alerts
- **Play short description:** One alert when a quake over your threshold hits near places you care about.
- **Keyword targets:** primary "earthquake alerts", "earthquake notification"; long-tail "earthquake alerts for another city", "aftershock notifications".
- **Play long description — first two lines:** "News says 'earthquake near Manila' — is that near your mom? Quake Watch sends one factual USGS-sourced alert when a quake above your magnitude threshold happens near the places you pick, anywhere in the world. Not an early-warning system — an awareness one."
- **Screenshot story:** add a faraway family city → threshold presets in plain language → single factual lock-screen push → detail with distance line and "a text gets through" note.
- **Launch channels:** diaspora community forums and subreddits (Filipino, Mexican, Japanese, Turkish communities — genuinely useful, lead with the family use case), r/earthquakes, Bay Area/PNW subreddits (post-event news moments bring search spikes; have the listing ready before the news, never ambulance-chase threads).
- **Review prompt moment:** next calm-day open after the second place is added. Excluded: within 72 h of any matched M6+ event (stress).
- **Pro candidates & anchor:** >5 places; quiet-alerts Supporter $5.99/yr (playbook §8).
- **Web/SEO queries:** "get notified of earthquakes near family", "earthquake alert app for specific city", "aftershock alert app", "earthquake app that is not early warning".

## 7. Risks

- Being mistaken for early warning is the reputational and ethical risk — the disclosure
  appears at onboarding, in settings, and in the store long description; App Review may probe
  this, and the honest framing is also the defense.
- News-event install spikes churn fast — the onboarding must reach "place added + push enabled"
  in under 60 seconds or the spike is wasted.
- USGS feed hiccups during major events (their load spikes too) — staleness indicator in-app,
  the family's fail-loud ingestion health rules, and never an implied all-clear.
