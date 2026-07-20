# Sow — Plan

**One sentence:** What to plant when, for your actual frost dates — a personal planting calendar
with one reminder a month and a garden log that remembers what last year taught you.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Architecturally a sibling of Home
Rhythm (curated dataset + profile → generated schedule → monthly batch reminder).

## 1. Product

- **Audience:** home vegetable/herb gardeners — a huge, passionate, seasonal audience that
  re-asks the same question every February: "when do I start tomatoes here?" Beginners
  especially (the post-2020 gardening cohort keeps renewing).
- **Gap:** the knowledge exists (seed packets, extension-service tables) but personalizing it
  to *your* frost dates and keeping the timing straight across 15 crops is exactly the job
  people fail at. Incumbent apps are ad-stuffed, subscription-walled, or web tools you forget
  by March. A quiet, offline, dataset-honest planner is unserved.
- **Core loop:** set location once → pick your crops → the year's plan generates → one push per
  month ("March: start tomatoes and peppers indoors") → log plantings and harvests → next year
  starts smarter ("you noted these bolted — start 2 weeks earlier").

Non-goals: plant identification (camera ML — different product), pest/disease diagnosis
(advice/liability — a "talk to your county extension office" pointer is the entire feature),
social/photo feeds, smart-device integration, ornamental landscape design (edibles + common
flowers only in MVP).

## 2. Datasets (`packages/domain-sow`) — the crown jewels

1. **Frost dates:** bundled coarse dataset (ZIP3 → median last-spring / first-fall frost,
   derived from NOAA climate normals) presented as **"typical for your area — adjust to your
   experience"** with one-tap override. Never pretend ZIP-level precision; local microclimates
   are real and gardeners know theirs. Cross-promo line: "For actual freeze warnings, Quiet
   Weather's frost pack watches the forecast."
2. **Hardiness zone:** USDA zone lookup (public data) — displayed context, not the scheduling
   driver (frost dates are).
3. **Crop dataset (~80 entries, sourced):** per crop — indoor-sow offset (weeks before last
   frost), transplant offset, direct-sow window, succession interval where applicable,
   fall-planting offset (from first frost), days to maturity, depth/spacing basics, a one-line
   "the mistake everyone makes" note. Every entry carries source refs (university extension
   publications — curated during implementation into `docs/crop-sources.md`) and the standing
   caveat "your seed packet's variety wins."

**Schedule generator (pure, golden-tested):** location profile + crop list → dated plan:
start-indoors / transplant / direct-sow / expected-harvest windows per crop, load-balanced
monthly batches (Home Rhythm's pattern). Goldens: no-freeze climates (fall/winter gardening
inverts — dataset's fall offsets must produce sane subtropical plans, or the crop is marked
"not modeled for frost-free zones" honestly), leap years, very short seasons (zone 3),
succession chains.

## 3. The log (what makes year two better)

- `plantings`: crop, variety text, dates (sown/transplanted), bed/container label, photo_ids[],
  notes; `harvests`: planting_id, date, note ("first ripe tomato!").
- Year-end carry-forward: last year's crops pre-selected for the new plan; notes surface at
  planning time ("2026 note: cilantro bolted — try earlier + shade").
- No streaks, no dead-plant guilt; a planting with no harvest logged is just quiet.

## 4. Notifications

One batch push per month during the active season (Home Rhythm rule): "March at your garden:
start tomatoes & peppers indoors; direct-sow peas when soil is workable." Optional single
frost-window nudge (opt-in): "~2 weeks to your typical last frost — hardening-off time."
Nothing else. Deterministic IDs; local-core scheduler.

## 5. Screens

- `/(onboarding)`: location (ZIP → typical frost dates shown → confirm/adjust) → crop picker
  (search + beginner starter packs: "Salsa garden," "Beginner 5") → the year at a glance.
  Under 3 minutes.
- `/` **This Month:** the batch — crop cards with the action (start indoors / transplant /
  sow), each opening the how-deep/how-far basics + the everyone's-mistake line + source.
- `/year`: season timeline per crop (sow→transplant→harvest bars); drag to personal-adjust
  (respecting the "why this date" explainer).
- `/garden`: plantings log with photos; harvest quick-add; bed/container grouping.
- `/crop/[key]`: the dataset entry rendered — offsets, basics, sources.
- `/settings`: frost-date override, family privacy page, export/import, dataset version +
  attribution, Quiet Weather cross-mention.

## 6. Phases & acceptance criteria

1. **Datasets:** frost-date table + 80 crops encoded with sources; schema tests; the
   no-freeze-zone honesty rule enforced in data.
2. **Generator:** goldens across the profile matrix (zones 3–10, frost-free, overrides,
   succession); busiest month ≤6 actions.
3. **App:** 3-minute onboarding measured; This Month; year timeline; crop pages.
4. **Log + notifications:** planting/harvest flows; carry-forward; monthly batch + frost nudge
   E2E (killed app, reboot reconcile).
5. **Release:** EAS, listing (§7), "no data collected."

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Sow: Planting Calendar
- **iOS subtitle:** What to plant when, your zone
- **iOS keyword field:** garden,vegetable,seeds,frost,grow,schedule,tomato,spring,herb,starter,harvest
- **Play title:** Sow: Planting Calendar
- **Play short description:** Your area's planting dates + one reminder a month. Offline, no ads.
- **Keyword targets:** primary "planting calendar", "when to plant vegetables"; long-tail "when to start tomato seeds indoors zone 6", "vegetable garden planner app free".
- **Play long description — first two lines:** "Every February, the same question: when do I start tomatoes here? Sow turns your area's typical frost dates into a personal planting calendar — start-indoors, transplant, and sowing windows for 80 crops, one quiet reminder a month, and a log that makes next year smarter."
- **Screenshot story:** frost-date confirm screen ("typical for your area — adjust") → March batch card → per-crop timeline bars → harvest log with a year-two note surfacing.
- **Launch channels:** r/gardening and r/vegetablegardening (both enormous; the February "when do I start seeds" thread wave is the moment — be present with the listing live by January), seed-swap and master-gardener communities, extension-office newsletter angle (the sourced-dataset posture fits them), spring short-video timing.
- **Review prompt moment:** after the first harvest is logged (the joy moment of the entire portfolio).
- **Pro candidates & anchor:** >20 crops, succession-planting planner, bed layouts (Phase 6); one-time $4.99.
- **Web/SEO queries:** "when to plant tomatoes in my zone", "seed starting calendar by zip code", "vegetable planting schedule app offline", "last frost date planting planner". Per-crop "when to plant X" pages are a large evergreen SEO surface (playbook §6).

## 8. Risks

- Frost-date precision theater is the trust trap — coarse data + loud override + "your
  experience wins" framing is the defense; a wrong confident date kills seedlings and reviews.
- Crop-dataset sourcing is a real research phase (extension publications vary by region) —
  budget it like Home Rhythm's; the "seed packet wins" caveat carries the rest.
- Extreme seasonality (installs Jan–May, silence after) — expected; the monthly reminder and
  harvest log carry retention into fall, and the year-two carry-forward is the reactivation
  hook. Judge the app on year-over-year return rate, not summer DAU.
