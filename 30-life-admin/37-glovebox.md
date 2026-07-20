# Glovebox — Plan

**One sentence:** Your car's complete service history in your pocket, with reminders that track
your actual mileage — no ads, no dealer upsells, no cloud.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** anyone keeping a car past its warranty (most people), multi-car households,
  keep-it-till-it-dies owners, and private-party sellers (a documented history adds real money
  at sale).
- **Gap:** the category exists but is enshittified — Drivvo/Fuelly-class apps are ad-saturated
  with accounts and cloud sync; dealer apps exist to sell service. The quiet version: a
  private log + odometer-projected reminders + a resale-ready PDF. (Recall checking stays in
  Recall Watch; the two cross-promote.)
- **Core loop:** log a service in 20 seconds when it happens → update the odometer when you
  think of it → reminders arrive when services are *actually* coming due at your driving rate
  → at sale time, export the binder.

Non-goals: fuel-economy tracking as a primary feature (a minimal optional fuel log exists
because reviews demand it; it never notifies), OBD/bluetooth integration, per-model factory
maintenance schedules (see §2 — generic intervals, honestly labeled), trip logging/mileage-for-
taxes (different product), social anything.

## 2. Domain (`packages/domain-glovebox`)

Data model (sqlite):
- `vehicles`: id, nickname, year/make/model (manual entry; optional one-shot client-side vPIC
  VIN decode — the family's single permitted network call, user-initiated, degrades to manual),
  odo_unit, purchase info?, registration_expires?, inspection_due?, archived_at?
- `odometer_readings`: vehicle_id, date, miles. Entered ad hoc; every service log also creates
  one.
- `service_types` (bundled defaults, per-vehicle tunable): oil (5k mi / 6 mo), tire rotation
  (7.5k), engine air filter (15k), cabin filter (15k), wiper blades (12 mo), brake inspection
  (10k), brake fluid (36 mo), coolant (60 mo/60k), transmission fluid (60k), spark plugs
  (100k), battery age check (36 mo), belt inspection (60k). Each carries a "generic interval —
  your owner's manual wins" flag surfaced in UI. Dual-trigger: whichever of miles/months comes
  first.
- `service_log`: vehicle_id, date, odometer, type_keys[], cost_cents?, shop ("DIY" first-class),
  receipt photo_ids[], parts/notes.

**Mileage-rate projection (pure, golden-tested):** robust rate from odometer readings —
weighted least squares over the trailing 12 months (recent readings weighted up), minimum two
points, fallback 1,000 mi/month; clamp to [100, 6,000] mi/month; recompute on every reading.
Due-date estimate per service = last-done + interval, converted through the rate; confidence
degrades honestly ("~March, based on your last odometer update in November — update it to
sharpen this").

**Notifications:** per service due: 3 weeks before projected date, batched per vehicle per
morning ("Corolla: oil change and rotation coming up around Mar 20"); registration/inspection
dates 30/7 days (or defer to Expiry Vault if user has it — detect nothing, just mention the
sibling once in settings). One "update your odometer?" nudge max every 90 days, only when
projection confidence is stale, and it's disable-able. Nothing else.

## 3. Screens

- `/(onboarding)`: add vehicle (year/make/model or VIN) → current odometer → "when was your
  last oil change?" (roughly is fine) → done. One vehicle, three questions.
- `/` **Garage:** card per vehicle — nickname, projected current mileage ("~48,300 mi"), next-
  due line, anything amber/red. Tap → vehicle home.
- `/vehicle/[id]`: **Timeline** (the hero — reverse-chron services with cost/odo/shop, odometer
  readings as small ticks) + **Due list** (each service type: last done, projected due, interval
  editor inline).
- `/log`: the 20-second capture — type chips (multi-select: oil + rotation same visit), date,
  odometer (pre-filled from projection), cost, shop autocomplete from history, receipt photo.
- `/export`: **Service Binder PDF** — vehicle summary, complete dated/odometer'd service table,
  receipts appendix; the private-sale trust artifact. Plus CSV.
- `/settings`: family privacy page, per-vehicle intervals, fuel-log toggle (off), export/import,
  Recall Watch cross-mention.

## 4. Phases & acceptance criteria

1. **Domain:** projection engine goldens (sparse readings, seasonal drivers with 6-month gaps,
   new-car zero history, unit conversion, clamps); dual-trigger due math; batching decisions.
2. **App:** onboarding 3 questions; Garage; Timeline + Due; 20-second log (stopwatch-tested,
   family standard).
3. **Notifications E2E:** due batch on killed device; odometer-nudge gating (must NOT fire when
   readings are fresh); reboot reconcile.
4. **Binder:** PDF from a 60-entry fixture history with 30 receipt photos (<25 MB, paginated);
   CSV; zip round-trip.
5. **Release:** EAS, listing (§5), "no data collected."

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Glovebox: Car Service Log
- **iOS subtitle:** History & smart reminders
- **iOS keyword field:** car,maintenance,vehicle,oil change,mileage,tracker,auto,records,odometer,garage,repair
- **Play title:** Glovebox: Car Maintenance Log
- **Play short description:** Your car's service history + reminders at your real mileage. No ads, no cloud.
- **Keyword targets:** primary "car maintenance app", "oil change reminder"; long-tail "car maintenance log app without ads".
- **Play long description — first two lines:** "A service log that respects you: log an oil change in 20 seconds, update your odometer when you remember, and get reminded when things are actually coming due at the rate you actually drive. No ads, no account, no dealer upsells."
- **Screenshot story:** Garage card ("~48,300 mi, oil due ~Mar 20") → 20-second log screen → timeline with costs → Service Binder PDF ("what a documented car is worth").
- **Launch channels:** r/MechanicAdvice + r/Cartalk (helpful presence), make-specific forums/subreddits (Toyota/Honda keep-forever crowds are the exact audience), r/askcarsales resale-documentation angle, DIY-maintenance YouTube comment communities.
- **Review prompt moment:** after the 3rd service logged (habit formed). Excluded: immediately after a costly repair entry.
- **Pro candidates & anchor:** >2 vehicles, Service Binder PDF, custom service types beyond 5; one-time $4.99.
- **Web/SEO queries:** "car maintenance tracker app no ads", "oil change interval reminder by mileage", "service records for selling car privately", "Drivvo alternative without account".

## 6. Risks

- Interval trust: generic defaults must always show the "owner's manual wins" flag — a wrong
  severe-service claim earns mechanic wrath in reviews; the flag plus per-vehicle tuning is the
  defense.
- Odometer staleness makes projections wrong — the honesty copy ("based on your Nov update")
  and the gated nudge handle it; never present a projected date without its basis.
- Fuel-log scope creep (the category's tar pit) — it stays a minimal optional table, never
  notifies, never grows charts beyond a single average; anything more is a different app.
