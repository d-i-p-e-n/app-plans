# Payback — Plan

**One sentence:** Is that solar quote fair? Production estimates, payback year, IRR, and a
sensitivity chart — with no lead form and no sales call.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** homeowners holding solar quotes — a permanently refreshing cohort, since
  every quote arrives via a lead-gen funnel (door-knockers, marketplace sites) and r/solar's
  standing advice is "run your own numbers before signing." Nobody gives them a private
  tool to do it with.
- **Gap:** every solar calculator online is a lead-capture form; the marketplace sites
  monetize the introduction. The math is deterministic once production is estimated — and
  **NREL's PVWatts API estimates production, free, no lead form** (a US-government public
  API; the Ladder-style single-permitted-fetch pattern applies).
- **Core jobs:** (1) "This $28k quote — what's the payback year, honestly?" (2) "Is
  $3.20/watt fair?" (3) "Which assumptions actually decide this?" (4) "Cash vs the
  installer's loan?" (5) "What if my utility's export rate is bad?"

Non-goals: installer recommendations or marketplace anything (the anti-feature), a
state/utility incentive database (staleness trap — federal ITC is modeled; local incentives
are user-entered line items with a link to DSIRE for homework), system design (panel/
inverter selection is the installer's job; we take the quote's specs as inputs), battery
economics in MVP (Phase 6 — resilience value is largely non-financial and deserves honest
separate treatment).

## 2. Engine (`packages/engine-payback`)

Inputs: from the quote — system size (kW DC), gross price, per-watt derived; location
(ZIP → lat/lon for PVWatts), tilt/azimuth (simple presets: roof direction picker), quoted
production if the installer gave one (compared against PVWatts — a divergence flag is
itself a finding); utility: current rate ($/kWh), annual escalation assumption (visible,
default conservative), compensation structure (`net_metering_full | export_rate` — the
NEM-3-style split where exports earn less; a self-consumption % slider with an honest "most
homes 20–40% without a battery" note); financials: federal ITC (30% through 2032-class
rules — verify at build), user-entered local incentives, financing (cash, or loan APR/term
with the **dealer-fee exposé**: solar loans commonly bury 15–30% dealer fees in the price —
the app computes the cash-vs-loan true cost at matched horizons, Payoff's discipline
pointed at this market's signature trick); degradation (0.5%/yr default), O&M/inverter-
replacement reserve line (visible, editable), panel-warranty horizon (25y default).

Outputs:
1. **Payback year + cumulative cash-flow curve** (the hero chart), nominal and
   NPV-at-your-discount-rate views.
2. **IRR** and the invest-instead comparison at user assumptions (Payoff pattern).
3. **$/W benchmark:** quote price/watt vs a published national/regional median (a small
   `tax-data`-style versioned data file with source citation and quarterly runbook — a
   benchmark, labeled as such, never "fair/unfair" in the app's voice).
4. **Sensitivity tornado** (Rent or Buy pattern): rate escalation, export rate,
   self-consumption %, degradation — showing that compensation structure usually dominates
   is the honesty the sales process omits.
5. **PVWatts divergence flag:** quoted production >10% above PVWatts → "ask your installer
   why" line (factual, sourced).

Oracles: PVWatts documented sample outputs (fixtures); hand-built cash-flow spreadsheets in
`docs/oracles/`; ITC application rules per IRS guidance. Goldens ≥50: export-rate vs full
NEM crossovers, loan-with-dealer-fee vs cash matched horizons, degradation compounding,
ITC on gross-vs-net-of-incentive bases (the ordering trap), zero-escalation cases.

## 3. Screens

- `/(onboarding)`: family disclaimer → "got a quote? enter it" (guided: size, price, roof
  direction) → PVWatts fetch (or manual production entry — full offline function per family
  rules) → the payback answer. Under 3 minutes from quote to curve.
- `/` **Verdict:** payback year + cumulative curve; $/W benchmark card; divergence flag if
  any; "these 3 assumptions drive your answer" chips (Rent or Buy pattern).
- `/assumptions`: every default visible with rationale + source; compensation-structure
  picker with plain-language explanations of net metering vs export rates.
- `/financing`: cash vs loan at matched horizons; the dealer-fee explainer.
- `/sensitivity`: the tornado + sliders.
- `/scenarios`: family-standard compare (quote A vs quote B — the two-quotes case is
  common and decisive).
- `/settings`: disclaimers, benchmark-data version + source, PVWatts attribution (NREL),
  export seam.

## 4. Phases & acceptance criteria

1. **Engine:** cash-flow core + ITC ordering + financing comparison; oracle spreadsheets
   to the cent; goldens.
2. **PVWatts integration:** fetch with caching + full manual fallback; divergence logic;
   fixture-tested.
3. **App:** 3-minute quote-to-curve measured; verdict/assumptions/financing/sensitivity/
   scenarios.
4. **Copy audit:** benchmark and divergence language stays factual (never "rip-off" — the
   numbers speak); Claiming Age rigor.
5. **Release:** EAS, listing (§5), "no data collected" (PVWatts fetch sends only
   coordinates; say so on the privacy page).

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Payback: Solar Math
- **iOS subtitle:** Check the quote. No calls.
- **iOS keyword field:** solar,panels,calculator,cost,savings,quote,roi,kwh,net metering,estimate,watt
- **Play title:** Payback: Solar Math
- **Play short description:** Is that solar quote fair? Payback, IRR & sensitivity — no lead form, no calls.
- **Keyword targets:** primary "solar calculator", "solar payback"; long-tail "is my solar quote too expensive", "solar panel cost per watt 2026".
- **Play long description — first two lines:** "Every solar calculator online is a lead form; yours shouldn't ring your phone. Payback takes the quote in your hand — size, price, your roof, your utility's rules — and computes the payback year, IRR, and which assumptions actually decide it, using NREL's public production model."
- **Screenshot story:** quote-entry to payback curve → $/W benchmark card → the dealer-fee cash-vs-loan reveal → sensitivity tornado → "no lead form, no calls" stance shot.
- **Launch channels:** r/solar (the channel — quote-check requests are its daily content; the app is the standing answer), r/homeowners, energy-nerd YouTube (quote-review genre), summer quote-season timing with SEO pages live by spring.
- **Review prompt moment:** after comparing two quotes in scenarios (the empowered moment).
- **Pro candidates & anchor:** battery module (Phase 6), >3 scenarios, PDF quote-review export (the "bring this to the negotiation" artifact); one-time $6.99.
- **Web/SEO queries:** "is my solar quote fair calculator", "solar payback calculator without phone number", "solar loan dealer fee explained", "pvwatts vs installer estimate". The dealer-fee explainer is the link-magnet article.

## 6. Risks

- Incentive-landscape sprawl is the scope trap — federal ITC + user-entered locals + a
  DSIRE pointer is the wall; a state database would rot and mislead.
- Compensation-structure variety (utility-by-utility) — the two-mode model + self-
  consumption slider covers the decision-relevant range honestly; the app never claims to
  model a specific utility's tariff sheet.
- The industry will hate it — expect hostile reviews from installer-adjacent accounts;
  respond with the numbers-speak posture and keep every claim sourced (the benchmark file's
  citations are the defense).
