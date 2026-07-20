# Recall Watch — Plan

**One sentence:** Silent until something you actually own is recalled.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. This app is built **first** in the
quiet-alerts family and stands up the shared backend.

## 1. Product

- **Audience:** parents of young children (car seats, cribs, strollers, formula, toys) as the
  beachhead; car owners and food-allergy households as fast followers. Parents are the most
  word-of-mouth-viral demographic that exists; recall anxiety is chronic and unserved.
- **Gap:** recall data is public, free, and authoritative (CPSC, FDA, USDA FSIS, NHTSA) but only
  reachable through unusable government sites and spammy news coverage. No consumer app filters
  recalls to *what you own*.
- **Why we win:** we ask for a tiny amount of manual input (your car, your kid gear, your pantry
  staples) and in exchange promise near-zero notifications — every one of which matters.

Non-goals: recall news feed for browsing all recalls (only matched ones are pushed; an "all
recent recalls" browse tab is fine but never notifies), lawyer referrals, shopping features.

## 2. Data sources (verify ToS/limits at implementation time)

| Source | What | Endpoint | Auth |
|---|---|---|---|
| NHTSA | Vehicle recalls | `https://api.nhtsa.gov/recalls/recallsByVehicle?make=&model=&modelYear=` | none |
| NHTSA vPIC | VIN decode → make/model/year | `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues/{vin}?format=json` | none |
| CPSC | Consumer product recalls | `https://www.saferproducts.gov/RestWebServices/Recall?format=json` (supports date filters) | none |
| openFDA | Food/drug/device enforcement | `https://api.fda.gov/food/enforcement.json` (+ `/drug/`, `/device/`) | free key raises limits |
| USDA FSIS | Meat/poultry/egg recalls | `https://www.fsis.usda.gov/fsis/api/recall/v/1` | none |

Notes for the agent:
- VIN decode happens **client-side at entry time** (one call, result stored as make/model/year in
  the subscription params). The VIN itself is never stored server-side — store only
  make/model/year as `topic_key` (privacy + matching works at campaign level anyway).
- CPSC/FDA/FSIS recalls name brands and products as free text. Matching is fuzzy by design —
  see §4.

## 3. Subscriptions (what a user registers)

| topic_type | topic_key | params | Entry UX |
|---|---|---|---|
| `vehicle` | `"{year}\|{make}\|{model}"` normalized | `{trim?}` | Type-ahead pickers fed by vPIC makes/models, or VIN scan/entry (decode client-side) |
| `product` | normalized brand+product string | `{upc?, brand, name, category}` | Barcode scan (`expo-camera` barcode mode) with OpenFoodFacts/UPCitemdb lookup for a name suggestion, or manual brand+name entry |
| `category` | one of a curated enum | `{}` | Checklist: infant car seats, cribs & bassinets, strollers, high chairs, toys ≤3y, infant formula, baby food, space heaters, e-bike batteries, … |
| `allergen` | enum (`peanut`, `milk`, …) | `{}` | Checklist; matches FDA/FSIS recalls whose reason mentions undeclared allergen |

Category subscriptions are the graceful-degradation path: exact product matching will miss things,
category matching catches them. Onboarding pushes categories first ("What's in your house?"),
specific products second.

## 4. Matching (in `packages/domain-recall`)

Pure functions, exhaustively Jest-tested, with a committed golden corpus:

1. **Normalization:** lowercase, strip punctuation/whitespace runs, expand common abbreviations
   (`mfg`, `w/`), collapse brand aliases (small curated alias table, e.g. "Graco Children's
   Products" → "graco").
2. **Vehicle:** exact join on normalized year|make|model against NHTSA campaign's affected
   vehicles list. High precision; this is the easy one.
3. **Product:** score = brand token match (required) + name token overlap (Jaccard on tokens) +
   optional UPC exact hit (some CPSC recalls list UPCs in the description — regex-extract 12/13
   digit codes at ingest into `match_keys`). Thresholds: UPC hit or (brand match AND overlap ≥
   0.5) → notify; brand match AND overlap ≥ 0.25 → "possible match" (shown in-app feed, notified
   only in a reduced 'possible match for something you own' form, max 1/week batched).
4. **Category:** ingest classifies each CPSC/FDA/FSIS recall into the category enum via keyword
   rules (committed, tested). If Gemini-based classification is ever added, follow the headlines
   pattern (structured output + human-reviewable), but keyword rules are the MVP.
5. **Golden corpus:** commit ~200 real recall records (fetched once, checked in as fixtures) with
   expected classifications/matches; regression-test every rule change against them.

## 5. Ingestion & dispatch

- `ingest-nhtsa`: daily. NHTSA has no clean "all new recalls" delta feed at campaign level —
  ingest by iterating the distinct `vehicle` subscriptions (query per year/make/model, cached;
  the subscribed-vehicle set is small). Store campaign as event with
  `match_keys=['vehicle:{year}|{make}|{model}', ...]`.
- `ingest-cpsc`: every 6h, `RecallDateStart` = last watermark. Emit events with match_keys:
  extracted UPCs, normalized brand tokens, categories.
- `ingest-fda`: every 6h, three endpoints, `report_date` watermark; classify allergen reasons.
- `ingest-fsis`: every 6h.
- `dispatch` (shared, family overview): joins match_keys → subscriptions. Recall pushes may break
  quiet hours only for `severity in ('serious','fatal-risk')` (CPSC "serious injury/death" or FDA
  Class I); everything else waits for morning.

## 6. Screens (Expo Router)

- `/(onboarding)` — 3 steps: promise ("We'll interrupt you almost never"), category checklist,
  optional push opt-in.
- `/` **My Stuff** — grouped list: Vehicles / Products / Categories / Allergens; add button; each
  row shows "✓ no active recalls" or a red badge.
- `/add` — segmented add flow (vehicle picker / barcode scan / manual product / categories).
- `/event/[id]` — recall detail: what, hazard, remedy (refund/repair/replace), CTA link to the
  official notice. Remedy is the point — lead with it.
- `/feed` — recent recalls in *your* categories (browse, never notifies beyond matches).
- `/settings` — notifications (per-type toggles, quiet hours, sent-log), data sources & attribution,
  privacy page ("Nothing you enter identifies you. VINs never leave your phone."), licenses.

## 7. Phases & acceptance criteria

**Phase 0 — Family scaffold** (this app bootstraps the monorepo)
- Monorepo per family overview; CI green on typecheck/lint/test; Supabase migrations 0001 applied
  locally (`supabase start && supabase db reset`); RPCs `register_device`/`upsert_subscription`
  covered by pgTAP or SQL tests; `packages/domain-alerts` decision core (quiet hours, dedupe)
  Jest-tested.

**Phase 1 — Domain**
- `packages/domain-recall` matching + classification passing the golden corpus; documented
  precision/recall numbers on the corpus in the package README (target: ≥0.9 precision on
  notify-level matches; misses go to category safety net).

**Phase 2 — Ingestion**
- All four `ingest-*` functions running on schedule locally; `ingest_runs` health table; sanity
  aborts; fixtures-based tests for each normalizer.

**Phase 3 — App**
- Full screen set; add-vehicle via picker and VIN; barcode scan; local feed; device registration +
  subscriptions synced via RPC; deep links from push payloads.

**Phase 4 — Push end-to-end**
- Physical iOS + Android devices receive matched-recall push with app killed; delivery idempotency
  proven (re-run dispatch, no duplicate); quiet-hours deferral proven with a test event.

**Phase 5 — Release**
- EAS production builds both stores; store listing (below); privacy questionnaires (anonymous IDs
  + push token only); `docs/` runbooks: push credentials, ingestion health, store submission.

## 8. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Recall Watch: Recall Alerts
- **iOS subtitle:** Car seat, car & food recalls
- **iOS keyword field:** baby,stroller,crib,formula,toys,vehicle,vin,safety,cpsc,fda,nhtsa,product,kids,check
- **Play title:** Recall Watch: Recall Alerts
- **Play short description:** Recall alerts for what you actually own. Cars, car seats, food. Quiet & free.
- **Keyword targets:** primary "car seat recall", "recall alerts"; long-tail "is my car seat recalled", "formula recall list".
- **Play long description — first two lines:** "Recalls are public, free, and impossible to follow — until something you own is on the list. Recall Watch checks CPSC, FDA, USDA, and NHTSA feeds against your stuff and stays silent until it matters."
- **Screenshot story:** My Stuff with all-clear checks → one real-style alert → recall detail leading with the remedy → the "1–3 notifications a month" never-manifest shot (playbook §3).
- **Launch channels:** r/NewParents, r/beyondthebump, r/daddit, r/Mommit (per each sub's self-promo rules), baby-gear buy/sell Facebook groups, car-owner forums; later: pediatric-office and daycare one-pagers.
- **Review prompt moment:** after the 5th item added shows an all-clear list (calm, invested). Excluded: any session with an active matched recall.
- **Pro candidates & anchor:** unlimited items, household share codes; quiet-alerts Supporter model $5.99/yr (playbook §8).
- **Web/SEO queries:** "car seat recall checker app", "app that alerts you about recalls", "check my car for recalls automatically", "baby formula recall alerts".

## 9. Risks

- Fuzzy product matching false positives erode trust fast — bias to precision; the category
  safety net covers recall misses.
- NHTSA per-vehicle query pattern needs caching discipline (one query per distinct vehicle per
  day, not per subscriber).
- Formula/food recalls spike news cycles; a spike-day burst must still respect per-device budget
  (batch multiple same-day matches into one push: "3 recalls match your items").
