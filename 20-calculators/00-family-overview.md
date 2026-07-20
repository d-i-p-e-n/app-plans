# Calculators Family — Overview

One monorepo (`calculators`), nine apps, **no backend**. Every app is the OptionPricer shape:
a dependency-free TypeScript engine with golden regression tests, wrapped in a small offline
Expo app. If a question arises about engine/test discipline, the answer is "what does
`packages/pricing-engine` in the Options Pricing Suite do?"

Apps: RSU Planner, Paycheck What-If, Ladder, Claiming Age, Quarterly, Headroom, Payoff,
Rent or Buy, Snowball.

## Monorepo layout

```text
apps/rsu-planner/
apps/paycheck-whatif/
apps/ladder/
apps/claiming-age/
apps/quarterly/
apps/headroom/
apps/payoff/
apps/rent-or-buy/
apps/snowball/
packages/engine-rsu/           Pure TS engine + Jest + goldens
packages/engine-paycheck/
packages/engine-ladder/
packages/engine-ssa/
packages/engine-quarterly/
packages/engine-headroom/
packages/engine-payoff/
packages/engine-rentbuy/
packages/engine-snowball/
packages/tax-data/             Versioned US tax parameters (see below)
packages/finmath/              Shared primitives: day counts, date math, rounding, currency fmt
packages/ui/
packages/entitlements/
docs/
STATUS.md
```

## Engine discipline (identical to Options Pricing Suite)

- Engines are dependency-free: no React, no Expo, no fetch, no Date.now() (clock injected).
  Inputs and outputs are plain typed objects. Deterministic.
- **Golden regression tests:** every engine commits a golden file of representative scenarios
  (≥50 per engine, spanning edge cases). `REGEN_GOLDENS=1 npm run regen-goldens -w
  packages/engine-<x>` is the only regeneration path; a normal `npm test` never rewrites goldens.
  Golden diffs reviewed line by line before commit.
- **Cross-checking:** each engine's plan names an independent oracle (IRS publication worked
  examples, SSA published examples, TreasuryDirect worked examples). Encode the oracle's worked
  examples as named unit tests *separate from* goldens — goldens catch drift, oracle tests catch
  being wrong.
- All money math in integer cents inside engines; format at the UI edge only (`finmath`).

## `packages/tax-data` — the maintenance strategy

US tax parameters change annually. Structure:

```text
packages/tax-data/src/
  y2026/federal.ts      Brackets, standard deduction, FICA wage base, supplemental rates,
                        401k/HSA/FSA limits — each value with a `source` citation string
  y2026/states/<xx>.ts  Per-state parameters (phased in; see Paycheck plan)
  y2026/ssa.ts          Bend points, COLA, FRA table, earnings test limits
  index.ts              getTaxYear(year) with explicit supported-years list
```

- Every constant carries its source (publication + page/URL) in a sibling comment or field.
- A `docs/annual-update-runbook.md` describes the each-January update: which IRS/SSA/state pages
  to check, in what order, and which oracle tests must be re-derived vs merely re-run.
- Apps must behave honestly when the data year ≠ current year: banner "Using 2026 tax data" with
  the app-update prompt. Never silently extrapolate.

## Compliance & tone (all four apps)

- First-launch disclaimer (blocking, one-time) and a permanent Settings page: *"Educational
  estimates only. Not tax, legal, investment, or benefits advice. Verify with a professional or
  the official source before acting."* Claiming Age adds SSA-specific language (its plan).
- No lead-gen, no advisor referrals, no "get matched with a professional" — the absence is the
  brand, exactly like OptionPricer.
- Results screens always show *how the number was computed* (expandable breakdown). Showing work
  is the differentiation against black-box lead-gen calculators.

## Shared app shell conventions

- Fully offline. No network permission usage except Ladder's optional yield fetch (its plan).
- Scenario persistence: AsyncStorage via a shared thin `packages/ui` storage hook; every app
  supports saving named scenarios and duplicating them for comparison (this is the calculators'
  core interaction: A/B compare).
- Every app has a comparison view: two saved scenarios side by side with deltas highlighted.
- Pro-candidate features (free at launch, behind `hasFeature`): >3 saved scenarios, CSV/PDF
  export of breakdowns, extra states in Paycheck.

## Build order within family

RSU Planner first (proves scaffold + tax-data + engine pattern), then Paycheck (heaviest data),
Ladder, Claiming Age in either order. Quarterly builds on Paycheck's federal machinery — schedule
it after Paycheck. Headroom builds on Claiming Age's SSA data (taxability) plus `tax-data`
Medicare/IRMAA tables — schedule it after Claiming Age. Payoff is standalone within the family;
Rent or Buy depends on `engine-payoff` (amortization/PMI) and the `tax-data` itemization check —
schedule it after Payoff. Snowball is standalone (its amortization is multi-debt-specific, not
shared with Payoff) and can slot anywhere after the family scaffold exists.
