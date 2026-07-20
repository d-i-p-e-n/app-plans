# Miles — Plan

**One sentence:** An IRS-ready business mileage log with zero background tracking — fast manual
entry, trip templates, odometer anchors, and an audit-shaped export.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Quarterly's natural companion —
same audience, cross-promoted both directions.

## 1. Product

- **Audience:** self-employed people who drive to clients on a *pattern* — consultants,
  realtors, therapists, home-service pros, landlords checking properties. The mileage
  deduction is worth thousands to them, and the IRS wants contemporaneous records they mostly
  don't keep.
- **Gap & honest positioning:** incumbents (MileIQ/Everlance-class) solve this with always-on
  background GPS — a battery drain, a subscription, and a location-surveillance trade many
  users hate. We refuse the surveillance and serve the drivers whose trips are *recurring and
  known*: template-based logging in three taps. **Gig drivers doing hundreds of unpredictable
  trips are explicitly not our user** — auto-tracking genuinely serves them better, and the
  store listing says who we're for rather than overclaiming.
- **Core loop:** drive to a client → three-tap log from a template → weekly nudge catches
  stragglers → quarterly/annual export drops a Schedule-C-ready log with odometer anchors.

Non-goals: background/always-on location (**never — it is the identity**), automatic trip
detection, expense tracking beyond mileage (Quarterly's domain neighbors it; receipts live in
apps built for them), route navigation, employer mileage-reimbursement admin (the export works
for reimbursement submission, but we build no approval workflows).

## 2. Domain (`packages/domain-miles`)

Data model (sqlite):
- `vehicles`: nickname, year-start odometer + date, year-end odometer + date (**IRS wants
  annual anchors; the app asks in January and December — two of its four yearly nudges**),
  optional periodic anchor readings.
- `places`: label ("Office", "Client — Riverside"), address text, favorite flag.
- `templates`: label ("Tuesday Riverside visit"), from/to places, miles, purpose category,
  round-trip flag — the heart of three-tap entry.
- `trips`: date, vehicle, from/to (places or free text), miles, purpose
  (`business | medical | charity | moving-military`), business-purpose note text (IRS wants
  the *why* — template carries a default), personal flag (personal miles matter for the
  business-use-percentage math), created_at (contemporaneousness evidence: entry date is
  recorded alongside trip date and shown in the export — honest, and audit-relevant).
- `rates` from `packages/tax-data` (calculators family): IRS standard mileage rates per year
  per purpose, including mid-year adjustments when they happen (the dataset handles a rate
  table per date-range, not per year).

Logic (pure, golden-tested): per-quarter and per-year totals by purpose; deduction math
(miles × dated rate, mid-year splits); business-use percentage per vehicle; distance sanity
check (same-named trip suddenly 3× its usual miles → inline "confirm?" nudge, never a block).

**One-shot measure (the only location use, optional):** an explicit "measure this drive"
button — foreground-only geolocation between user-pressed start and stop, distance saved,
nothing stored but the number, permission requested only on first use with a plain pre-prompt.
No geofencing, no motion detection, no history. Degrades to manual entry forever if declined.

## 3. Exports (the deliverable)

- **Mileage Log PDF/CSV:** date, from → to, business purpose, miles, rate, deduction — plus
  the odometer-anchor table, per-quarter subtotals, business-use percentage, and a method
  statement ("manually logged; entry timestamps included"). Formatted to hand a CPA or an
  auditor. Fixture: 400-trip year → <10 s, clean pagination.
- **Quarterly summary:** the one number Quarterly's estimated-tax math wants ("Q3 business
  miles: 1,240 → $868 deduction at 2026 rates") with a cross-promo deep link.
- Family-standard zip backup/restore.

## 4. Notifications (four kinds, all sparse)

Weekly catch-up (opt-in, one push: "Log last week's drives? Templates make it 10 seconds"),
the two odometer-anchor asks (January/December), and quarter-end summary (opt-in, pairs with
Quarterly's deadlines). Deterministic IDs; local-core scheduler; nothing else.

## 5. Screens

- `/(onboarding)`: who-it's-for honesty ("Drive to clients on a pattern? Three taps per trip.
  Hundreds of unpredictable gig trips? An auto-tracker will serve you better.") → vehicle +
  starting odometer → first places/template.
- `/` **Log:** this week's trips, the three-tap add bar (template chips first), month total
  ticker with running deduction.
- `/add`: template tap → date defaults today → save; or manual (places autocomplete, miles,
  purpose); the measure-this-drive button lives here.
- `/templates` + `/places`: management; per-template usage counts.
- `/reports`: quarter/year views, export buttons, business-use percentage, anchor status
  ("December odometer reading due").
- `/settings`: rates table shown with sources ("2026: $0.70/mi business" — verify at build
  time), family privacy page (location stance in bold), export/import, Quarterly
  cross-mention.

## 6. Phases & acceptance criteria

1. **Domain:** totals/deduction math with mid-year rate-change goldens; business-use
   percentage; sanity-check logic; `tax-data` mileage-rate table with sources.
2. **App:** three-tap template log measured (<10 s); places/templates; week view.
3. **Exports:** 400-trip fixture PDF/CSV within budget; anchor table; method statement; zip
   round-trip.
4. **Measure + notifications:** one-shot measure on both platforms (permission pre-prompt,
   foreground-only verified — no background modes in the app manifest, checked in CI);
   weekly/anchor/quarter nudges E2E with reboot reconcile.
5. **Release:** EAS, listing (§7), "no data collected"; manifest audit proving no background
   location entitlement ships.

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Miles: Tax Mileage Log
- **iOS subtitle:** IRS-ready, no tracking
- **iOS keyword field:** business,deduction,irs,odometer,schedule c,self employed,drive,trip,realtor,write off
- **Play title:** Miles: Tax Mileage Log
- **Play short description:** An IRS-ready mileage log with zero background tracking. Private, offline.
- **Keyword targets:** primary "mileage log", "mileage tracker for taxes"; long-tail "mileage tracker without gps tracking", "irs mileage log requirements app".
- **Play long description — first two lines:** "The mileage deduction is worth thousands — the surveillance shouldn't be the price. Miles is a template-based log for people who drive to clients on a pattern: three taps per trip, odometer anchors the IRS actually asks for, and a Schedule-C-ready export. No background GPS, ever."
- **Screenshot story:** three-tap template log → running deduction ticker → the audit-shaped export with anchor table → "no background GPS" stance shot → who-it's-for honesty frame.
- **Launch channels:** r/freelance and r/tax (with Quarterly — pitch them together as the freelancer pair), realtor and therapist professional groups/newsletters (patterned-driving archetypes), r/smallbusiness, privacy communities (the anti-MileIQ stance travels).
- **Review prompt moment:** after the first quarterly or annual export.
- **Pro candidates & anchor:** multiple vehicles, unlimited templates (free cap generous), CPA-packet export variants; one-time $4.99.
- **Web/SEO queries:** "mileage log app without tracking", "irs mileage log requirements 2026", "mileage tracker one time purchase no subscription", "realtor mileage deduction log". The IRS-requirements explainer is the link-magnet page.

## 8. Risks

- Manual-entry decay is the product risk — templates, the weekly nudge, and honest audience
  selection ("patterned drivers") are the mitigations; we do not chase the gig-driver segment
  with tracking features, ever (charter line).
- Rate-table staleness (IRS mid-year adjustments) — the dated-range design plus the
  calculators family's update runbook; a wrong rate in an export is the worst failure mode, so
  rates render with their effective dates everywhere.
- Contemporaneousness overclaiming — we show entry timestamps and say "log promptly"; we never
  market the app as audit-proof (same honesty discipline as Deposit Defense).
