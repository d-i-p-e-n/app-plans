# Shortage Watch — Plan

**One sentence:** One calm alert when a medication you take enters — or leaves — FDA-reported
shortage, with your med list never leaving your phone.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Part of the quiet-alerts family but
with a **deliberate architectural deviation** (§3): matching happens on-device because
medication names are too sensitive to store server-side, even hashed.

## 1. Product

- **Audience:** anyone on a chronically shorted medication — ADHD stimulant users (rolling
  shortages since 2022; r/ADHD's "pharmacy roulette" threads are endless), GLP-1 users, thyroid
  patients, parents of kids on shorted formulations, chemo caregivers. Desperate, underserved,
  and currently refreshing an unusable FDA website.
- **Gap:** the FDA publishes shortage data; nobody delivers it as a quiet, personal signal.
  Incumbent "medication apps" are pharmacy-chain marketing surfaces; shortage awareness today
  is Reddit rumor plus calling five pharmacies.
- **The two pushes that matter:** "entered shortage" (start calling ahead / ask your prescriber
  about timing) and — the emotionally huge one — **"resolved"** (relief; the app most earns its
  review here).

Non-goals: pharmacy stock locators (no reliable data exists; never fake it), alternative-
medication suggestions (clinical advice — never), refill reminders (Health Binder's job;
cross-mention only), any interpretation beyond FDA-published facts.

## 2. Data sources

| Source | What | Notes |
|---|---|---|
| FDA Drug Shortages database | Current + resolved shortages, per-presentation detail, reasons, estimated durations | Public; JSON/downloadable feed off accessdata.fda.gov — verify current endpoint shape at build time. Primary source; US-government public domain |
| ASHP shortage list (drugshortages.org) | Broader practitioner-maintained list | Often earlier than FDA but ToS-restricted — **evaluate licensing before any use**; FDA-only MVP is fine |
| RxNorm subset (NLM) | Generic↔brand name mapping | Public domain; bundle a curated subset (~2k common drugs) for matching + autocomplete |

The full active-shortage list is small (hundreds of entries, tens of KB) — which is what makes
the privacy architecture possible.

## 3. The privacy architecture (the headline feature)

Medication lists are among the most sensitive data in this portfolio — more identifying than
Breach Watch's emails (a med list can reveal diagnoses). So this app inverts the family
pattern: **the server never learns what anyone takes.**

- Server side: `ingest-fda` (every 6 h) normalizes the shortage list into `events` as usual —
  but there are **no per-med subscriptions**. Devices register for exactly one topic:
  `shortage_list_changed`.
- On any material list change, dispatch sends a **content-free silent/background push** ("data
  changed") to all registered devices. The client then downloads the current compact list
  (a single cached JSON blob served via edge function, ~10–40 KB) and runs matching **locally**
  against the on-device med list (normalized generic names + RxNorm alias resolution, in
  `packages/domain-shortage` — pure, golden-tested).
- Local matches fire **local notifications**. Daily foreground/background fetch is the fallback
  for devices where silent pushes are throttled (document per-OS reliability honestly; iOS
  background push is best-effort — the daily fetch-on-open makes the app correct even if every
  silent push is dropped, just slower).
- Consequence to accept: no server-side `deliveries` idempotency — dedupe is local (delivered
  set in sqlite, deterministic IDs `{drug}:{status_change_date}`).
- The in-app privacy page explains this design in plain language; it is the marketing.

## 4. Alert logic (`packages/domain-shortage`)

1. **Entered shortage:** matched drug appears with status Current → notify: "Methylphenidate ER
   is now in FDA-reported shortage (3 of 7 presentations affected). Your pharmacy may differ —
   calling ahead helps." Facts + one practical sentence; never alarm tone.
2. **Status change:** affected-presentations list materially changes for a matched drug →
   feed update; push only if user's noted strength (optional field) newly appears.
3. **Resolved:** status → Resolved → the relief push.
4. **Expectation honesty everywhere:** FDA reporting lags street reality both directions;
   every surface carries "FDA-reported status — your pharmacy may differ."
5. Budget: max 1 push/drug/status-change; quiet hours always respected (nothing here is a
   3 a.m. matter).

## 5. Screens

- `/(onboarding)`: the privacy promise ("Your med list never leaves this phone — here's the
  architecture, in one paragraph") → add medications (autocomplete over bundled RxNorm subset;
  brand or generic, optional strength) → push opt-in.
- `/` **My Meds:** card per med — ✓ no reported shortage / amber "in shortage since {date}" /
  green "resolved {date}"; last-list-refresh timestamp (honesty about data age).
- `/event/[id]`: detail — affected presentations, FDA-stated reason and estimated duration
  when published, link to the FDA entry, the "pharmacist conversation" neutral paragraph.
- `/feed`: status changes for your meds only.
- `/settings`: family standard + the architecture page + FDA attribution + the "never"
  manifest (no stock claims, no med suggestions, no refill nags).

## 6. Phases & acceptance criteria

1. **Domain:** name normalization + RxNorm alias matching goldens (brand→generic, combination
   products, salt-form variants — the classic matching traps); status-transition logic;
   local-dedupe determinism.
2. **Backend:** `ingest-fda` + compact-list edge endpoint + content-free dispatch;
   `ingest_runs` health rows; list-blob caching.
3. **App:** onboarding, autocomplete, My Meds, detail, local matching + local notifications
   E2E (fixture list swap → correct local pushes, killed app).
4. **Reliability matrix:** silent-push vs daily-fetch behavior verified on physical iOS +
   3 Android OEMs; documented per-OS in `docs/`.
5. **Release:** EAS, listing (§7), privacy questionnaire: anonymous device ID only — med
   data never transmitted (and the store label proves the architecture).

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Shortage Watch: Med Alerts
- **iOS subtitle:** Know when your Rx is short
- **iOS keyword field:** drug,medication,pharmacy,adhd,fda,supply,medicine,stimulant,refill,status,notify
- **Play title:** Shortage Watch: Med Alerts
- **Play short description:** One alert when a medication you take enters or leaves FDA shortage.
- **Keyword targets:** primary "drug shortage", "medication shortage alert"; long-tail "adderall shortage tracker", "is my medication in shortage".
- **Play long description — first two lines:** "Pharmacy roulette is exhausting. Shortage Watch sends one calm notification when a medication you take enters FDA-reported shortage — and one when it's resolved — with your med list stored only on your phone, by architecture, not by promise."
- **Screenshot story:** the architecture promise ("your meds never leave this phone") → My Meds status cards → the "resolved" relief push → FDA-sourced detail with presentations.
- **Launch channels:** r/ADHD (the single highest-fit community in this batch — follow its strict rules, lead with the privacy architecture), r/Thyroid, chronic-illness newsletters, pharmacist communities (r/pharmacy critique-first — pharmacists field these questions all day and may recommend it).
- **Review prompt moment:** first app open after a "resolved" notification. Excluded: while any of the user's meds is in active shortage.
- **Pro candidates & anchor:** >10 medications, household lists; quiet-alerts Supporter $5.99/yr (playbook §8).
- **Web/SEO queries:** "app that alerts when drug shortage ends", "adderall shortage status tracker", "fda drug shortage list notifications", "how to know when medication is back in stock".

## 8. Risks

- FDA lag vs street reality is the trust risk — the "your pharmacy may differ" honesty line is
  mandatory on every surface, and the app never implies stock availability.
- Silent-push throttling degrades timeliness — the daily-fetch fallback keeps correctness;
  set the expectation ("checked at least daily") rather than overpromising real-time.
- Name matching errors are high-stakes (a missed match = a missed shortage) — the RxNorm
  golden corpus and combination/salt-form traps get the deepest test investment in the family.
