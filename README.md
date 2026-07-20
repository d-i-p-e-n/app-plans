# App Plans

Implementation-ready plan documents for a portfolio of 37 US-market mobile apps plus a
20-app international expansion — calculators for Canada, India, the UK, and Australia, and an
EU/Germany program (calculators + quiet-alerts) with its own regulatory framework — all built
on the same stack as the Options Pricing Suite (`C:\dev\OptionPricer`): Expo + React Native +
TypeScript monorepos, dependency-free domain engines with golden regression tests, and (where a
backend is required) Supabase, following the patterns proven in Only Breaking
(`C:\Users\djpatel\Documents\Code\headlines`).

Every app shares one product philosophy: **single-purpose, quiet, no accounts, no ads, no data
harvesting.** Each app wins by refusing to do things incumbents are structurally forced to do.

## How to use these plans (instructions for an implementing AI agent)

1. Read [00-shared-standards.md](00-shared-standards.md) **first and in full**. It is binding for
   every app. App plans only document deviations from it.
2. Read [01-growth-playbook.md](01-growth-playbook.md) — the adoption & monetization process
   (ASO, store listings, keywords, launch, SEO, when/how to monetize). Each app plan's
   "Adoption & monetization" section supplies that app's inputs to the playbook.
3. Read the family overview (`00-family-overview.md`) for the repo you are working in. It defines
   the monorepo layout, shared packages, and (for quiet-alerts) the shared Supabase backend.
4. Read the specific app plan. Implement phase by phase, in order. Every phase has acceptance
   criteria; do not start a phase until the previous phase's criteria pass.
5. All external API details (rate limits, auth, ToS) in these plans were checked in July 2026.
   **Re-verify them at implementation time** before building against them.
6. Keep a `STATUS.md` at the repo root current as you work (what is implemented, what remains,
   continuation instructions for the next agent) — same convention as the headlines repo.

## Repo map (6 app repos + 1 web repo)

| Repo | Apps | Backend |
|---|---|---|
| `quiet-alerts` | Recall Watch, Quiet Weather, Air & Allergy, Holdings Calendar, Streaming Arrivals, Breach Watch, Quake Watch, Shortage Watch | One shared Supabase project |
| `calculators` | RSU Planner, Paycheck What-If, Ladder, Claiming Age, Quarterly, Headroom, Payoff, Rent or Buy, Snowball, Aid Index, Sixty-Five | None (fully local; optional read-only public data fetches) |
| `life-admin` | Return & Warranty Tracker, Renewals, HSA/FSA Vault, Deposit Defense, Expiry Vault, Home Rhythm, Glovebox, Pet Papers, Health Binder, Contents, Card Perks, Applied, Sow, Miles | None (local-first, local notifications) |
| `shift-life` | Shift Life | None (local-first) |
| `big-buttons` | Big Buttons | None (local-first) |
| `first-years` | First Years | None (local-first, zero-network) |
| `noise` | Noise | None (local-only, zero-network, no notifications) |
| `calculators-ca` | CPP Timing, Paycheque, Renewal, Room (+ wave-2 ports) | None (fully local) |
| `calculators-in` | In-Hand, Advance Tax, Prepay, FD Ladder (+ wave-2 ports) | None (fully local) |
| `calculators-uk` | Take-Home, Cliffs, Remortgage (+ wave-2 ports) | None (fully local) |
| `calculators-au` | Take-Home AU, Cap Room, Offset (+ wave-2 ports) | None (fully local) |
| `calculators-de` | Brutto-Netto, ETF-Steuer, Elterngeld (+ wave-2) — German-first | None (fully local) |
| `quiet-alerts-eu` | Rückruf-Radar, Leises Wetter, Engpass-Radar (+ wave-2) — German-first | Own Supabase project, EU region (GDPR posture per 60-eu overview) |
| `quiet-site` | Umbrella marketing/SEO site (one page per app, country pages under /ca /in /uk) | Static (Cloudflare Pages) |

## Documents

- [00-shared-standards.md](00-shared-standards.md) — binding engineering/product conventions
- [01-growth-playbook.md](01-growth-playbook.md) — binding adoption & monetization process

### quiet-alerts family
- [10-quiet-alerts/00-family-overview.md](10-quiet-alerts/00-family-overview.md) — shared backend, ingestion/dispatch pipeline, shared packages
- [10-quiet-alerts/11-recall-watch.md](10-quiet-alerts/11-recall-watch.md) — product recalls filtered to what you own
- [10-quiet-alerts/12-quiet-weather.md](10-quiet-alerts/12-quiet-weather.md) — actionable-only weather alerts
- [10-quiet-alerts/13-air-allergy.md](10-quiet-alerts/13-air-allergy.md) — AQI/pollen threshold alerts
- [10-quiet-alerts/14-holdings-calendar.md](10-quiet-alerts/14-holdings-calendar.md) — earnings/dividend dates for a manual watchlist
- [10-quiet-alerts/15-streaming-arrivals.md](10-quiet-alerts/15-streaming-arrivals.md) — "your show is now on a service you pay for"
- [10-quiet-alerts/16-breach-watch.md](10-quiet-alerts/16-breach-watch.md) — one push when your email appears in a new data breach
- [10-quiet-alerts/17-quake-watch.md](10-quiet-alerts/17-quake-watch.md) — earthquakes above your threshold near places you love
- [10-quiet-alerts/18-shortage-watch.md](10-quiet-alerts/18-shortage-watch.md) — FDA drug-shortage alerts; med list never leaves the phone

### calculators family
- [20-calculators/00-family-overview.md](20-calculators/00-family-overview.md) — shared engine/testing conventions, tax-data packages
- [20-calculators/21-rsu-planner.md](20-calculators/21-rsu-planner.md) — equity comp planner
- [20-calculators/22-paycheck-whatif.md](20-calculators/22-paycheck-whatif.md) — take-home pay modeling
- [20-calculators/23-ladder.md](20-calculators/23-ladder.md) — T-bill/CD ladder builder
- [20-calculators/24-claiming-age.md](20-calculators/24-claiming-age.md) — Social Security claiming-strategy calculator
- [20-calculators/25-quarterly.md](20-calculators/25-quarterly.md) — freelancer estimated-tax planner
- [20-calculators/26-headroom.md](20-calculators/26-headroom.md) — Roth-conversion / bracket & IRMAA headroom
- [20-calculators/27-payoff.md](20-calculators/27-payoff.md) — mortgage extra-payment / recast / refi math without lead-gen
- [20-calculators/28-rent-or-buy.md](20-calculators/28-rent-or-buy.md) — rent-vs-buy with every assumption visible
- [20-calculators/29-snowball.md](20-calculators/29-snowball.md) — debt payoff planner with no loan ads and no judgment
- [20-calculators/2a-aid-index.md](20-calculators/2a-aid-index.md) — FAFSA Student Aid Index from the published formula, no lead-gen
- [20-calculators/2b-sixty-five.md](20-calculators/2b-sixty-five.md) — Medicare enrollment windows & penalty math, nothing to sell

### life-admin family
- [30-life-admin/00-family-overview.md](30-life-admin/00-family-overview.md) — local-first storage, local notifications, receipt/photo conventions
- [30-life-admin/31-return-warranty.md](30-life-admin/31-return-warranty.md) — return windows & warranty expiries
- [30-life-admin/32-renewals.md](30-life-admin/32-renewals.md) — subscription/trial tracker, no bank linking
- [30-life-admin/33-hsa-fsa-vault.md](30-life-admin/33-hsa-fsa-vault.md) — receipt vault + deadline alerts
- [30-life-admin/34-deposit-defense.md](30-life-admin/34-deposit-defense.md) — renter move-in/out documentation
- [30-life-admin/35-expiry-vault.md](30-life-admin/35-expiry-vault.md) — passports, licenses, registrations, certs — reminded early enough
- [30-life-admin/36-home-rhythm.md](30-life-admin/36-home-rhythm.md) — seasonal home maintenance without the nagging
- [30-life-admin/37-glovebox.md](30-life-admin/37-glovebox.md) — car service log + odometer-projected reminders
- [30-life-admin/38-pet-papers.md](30-life-admin/38-pet-papers.md) — pet vaccine records + boarding-ready kennel card
- [30-life-admin/39-health-binder.md](30-life-admin/39-health-binder.md) — family med lists, allergies & one-tap intake sheets
- [30-life-admin/3a-contents.md](30-life-admin/3a-contents.md) — home inventory for insurance claims, before you need it
- [30-life-admin/3b-card-perks.md](30-life-admin/3b-card-perks.md) — credit-card fees & expiring credits, no bank linking
- [30-life-admin/3c-applied.md](30-life-admin/3c-applied.md) — private job-search tracker, no cloud, no LinkedIn
- [30-life-admin/3d-sow.md](30-life-admin/3d-sow.md) — personal planting calendar from your frost dates
- [30-life-admin/3e-miles.md](30-life-admin/3e-miles.md) — IRS-ready mileage log with zero background tracking

### standalone
- [40-standalone/41-shift-life.md](40-standalone/41-shift-life.md) — rotating-shift calendar & sleep planner
- [40-standalone/42-big-buttons.md](40-standalone/42-big-buttons.md) — elder-first single-purpose tool suite
- [40-standalone/43-first-years.md](40-standalone/43-first-years.md) — quiet baby milestones, vaccine schedule & well-visit prep
- [40-standalone/44-noise.md](40-standalone/44-noise.md) — sleep sounds that never ask for $70 a year

### international calculators
- [50-intl-calculators/00-intl-overview.md](50-intl-calculators/00-intl-overview.md) — internationalization strategy: per-country apps/repos, tax-data localization, compliance & pricing deltas, country sequencing
- [50-intl-calculators/51-calculators-canada.md](50-intl-calculators/51-calculators-canada.md) — CPP Timing, Paycheque, Renewal (term shock/IRD), Room (RRSP/TFSA)
- [50-intl-calculators/52-calculators-india.md](50-intl-calculators/52-calculators-india.md) — In-Hand (CTC + regimes), Advance Tax (44ADA), Prepay (EMI vs tenure), FD Ladder
- [50-intl-calculators/53-calculators-uk.md](50-intl-calculators/53-calculators-uk.md) — Take-Home (plans + Scotland), Cliffs (£100k/childcare/HICBC), Remortgage
- [50-intl-calculators/54-calculators-australia.md](50-intl-calculators/54-calculators-australia.md) — Take-Home AU (HECS + super), Cap Room (caps/carry-forward/Div 293), Offset (redraw tax trap)

### EU program
- [60-eu/00-eu-overview.md](60-eu/00-eu-overview.md) — Germany-first strategy + the EU regulatory framework (GDPR incl. Art. 27, Impressum, EAA, CRA timeline, MDR scope-avoidance, StBerG/RDG advice walls)
- [60-eu/61-calculators-germany.md](60-eu/61-calculators-germany.md) — Brutto-Netto (Programmablaufplan oracle), ETF-Steuer (Vorabpauschale/Freistellungsauftrag), Elterngeld planner
- [60-eu/62-quiet-alerts-eu.md](60-eu/62-quiet-alerts-eu.md) — Rückruf-Radar (Safety Gate/RASFF), Leises Wetter (DWD/MeteoAlarm), Engpass-Radar (BfArM) on an EU-region backend

## Recommended build order

1. **Renewals** (life-admin) — smallest surface, zero backend, proves the local-notification and
   local-storage foundations the rest of life-admin reuses.
2. **Recall Watch** (quiet-alerts) — highest product conviction; building it stands up the entire
   shared quiet-alerts backend that the rest of that family then reuses cheaply.
3. **RSU Planner** (calculators) — proves the calculators family scaffold and the tax-data package
   pattern.
4. Remaining apps in any order; each additional family app should cost a fraction of its family's
   first. `quiet-site` goes live with the first app launch (playbook §6–7). Sequencing notes
   among the newer plans: **Expiry Vault** and **First Years** have the strongest gap-to-effort
   ratios; **Quake Watch** is the cheapest quiet-alerts add; **Shortage Watch** documents a
   deliberate on-device-matching deviation — read it before assuming the family pattern;
   **Contents** must follow Deposit Defense (it extracts that app's capture engine); **Payoff**
   precedes **Rent or Buy**; **Quarterly** and **Miles** are a natural pair sharing audience and
   `tax-data`; **Noise** is gated on its playback-engineering spike; **Breach Watch** carries
   real API cost — read its plan's cost section first.
5. **International calculators** start only after the US calculators flagship is live, one
   country at a time (Canada → India → UK → Australia), per the sequencing and update-burden
   rules in [50-intl-calculators/00-intl-overview.md](50-intl-calculators/00-intl-overview.md) §5.
6. **The EU program** sequences independently (it is not "country five" of the calculators
   line): Germany calculators first — no backend, no Art. 27 question — then the EU
   quiet-alerts backend only after the GDPR checklist in
   [60-eu/00-eu-overview.md](60-eu/00-eu-overview.md) §3.1 is fully ticked. Other EU
   countries need their own investigation docs before any planning.

## Evaluated but not planned (backlog)

Ideas assessed during portfolio planning that did not clear the bar — recorded so future
sessions don't re-litigate them from scratch:

- **In Case (estate/emergency readiness binder)** — on-thesis and unserved, but the legal
  adjacency and the overlap with Health Binder's directives-pointer need more thought; revisit
  after Health Binder ships.
- **Price Watch (price-drop alerts)** — real gap, but retailer price data is scrape-hostile and
  Keepa-class APIs are paid + Amazon-only; revisit if a licensing path appears.
- **Vote Window (nonpartisan election-deadline reminders)** — genuine quiet-alerts shape, but a
  50-state hand-maintained dataset with civic-trust stakes; too heavy for now.
- **Moving Day (address-change checklist)** — real pain, one-time use, thin retention; possible
  future Deposit Defense companion feature instead of an app.
- **Freezer/pantry inventory** — entry friction violates the <20-second capture bar at grocery
  scale; no honest fix found.
- **Next Dollar (order-of-operations money flowchart)** — appealing and famous (the r/pf prime
  directive), but its entire output is "do X with your money next," which crosses the
  portfolio's no-personalized-advice line that Claiming Age/Headroom carefully stay behind.
  Permanently out unless a purely educational framing survives a copy audit.
- **Timezone meeting planner** — well-served by free web tools; no enshittification wedge.
- **Roommate expense splitter** — the job requires multi-party sync, which requires accounts;
  structural conflict with the charter. Out.
- **Recipe clipper** — the category has well-loved, fairly-priced incumbents (Paprika-class);
  not a hated market, so the refusal-positioning has nothing to push against.

All names are working titles; check App Store / Play Store availability and trademarks before
release (playbook §10).
