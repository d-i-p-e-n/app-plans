# International Calculators — Overview

Strategy and shared architecture for taking the calculators family beyond the US. Read
[../00-shared-standards.md](../00-shared-standards.md),
[../01-growth-playbook.md](../01-growth-playbook.md), and
[../20-calculators/00-family-overview.md](../20-calculators/00-family-overview.md) first — all
three remain binding; this document adds the internationalization decisions on top.

Country plans: [51-calculators-canada.md](51-calculators-canada.md),
[52-calculators-india.md](52-calculators-india.md),
[53-calculators-uk.md](53-calculators-uk.md).

## 1. Why calculators travel (and the other families mostly don't)

Calculators are pure engines + country parameter data — no backends, no data-feed licensing,
no push infrastructure. Every country has the same underlying questions (take-home pay, when
to claim the pension, pay down the mortgage or invest, what to send the tax authority) wrapped
in different rules — and in every country, the online answers are the same lead-gen swamp the
US apps position against. The refusal-hook translates verbatim; only the math changes.

Quiet-alerts and life-admin internationalize later and differently (data sources and store
norms vary much more); nothing in this section touches them.

## 2. Structural decisions (made — do not re-litigate per country)

1. **Separate apps per country, not one multi-country app.** Local ASO ("CPP calculator",
   "in-hand salary", "take home pay UK") is the entire acquisition strategy; a country picker
   inside one app forfeits it. Local store listings, local screenshots, local disclaimers,
   local pricing. The brand names differ per country where the local term demands it.
2. **One monorepo per country** (`calculators-ca`, `calculators-in`, `calculators-uk`),
   mirroring the US repo's layout exactly (apps/, packages/engine-*, packages/tax-data,
   packages/finmath, packages/ui, packages/entitlements, docs/, STATUS.md). Same CI, same
   golden-test discipline, same phase-gate working agreements.
3. **Copy-in, don't cross-depend** (established family precedent). At repo creation, copy
   `finmath`, `ui`, `entitlements`, and any near-universal engine (e.g., Snowball's multi-debt
   amortization) from the US repo, then let them diverge. Record the source commit in the
   copied package's README. Universal-math divergence should stay near zero; tax-data diverges
   by design.
4. **`tax-data` becomes `tax-data` per repo with country structure:** same design — every
   constant carries a source citation, versioned by the country's tax year, honest banners
   when stale, and a country-specific annual-update runbook naming the authority pages to
   check (CRA/Revenu Québec; CBDT/Finance Act; HMRC/GOV.UK).
5. **Tax-year semantics are data, not assumptions:** UK years run 6 April–5 April; India runs
   April–March (FY vs AY naming matters in copy); Canada is calendar. `finmath` gains a
   `TaxYear` abstraction per repo; engines never hardcode January.
6. **Currency/locale:** integer minor-units everywhere (cents/paise/pence), `Intl`-based
   formatting at the UI edge, lakh/crore grouping for India (₹12,50,000 — non-negotiable for
   credibility there).

## 3. Compliance localization (binding per country)

The US "educational, not advice" disclaimer translates but must name local regimes:
- **Canada:** "Educational estimates from published CRA/Service Canada formulas. Not financial,
  tax, or benefits advice." No implication of Service Canada affiliation.
- **India:** add "Not investment advice; not a SEBI-registered investment adviser" wherever a
  comparison could be read as advice, plus "verify with a CA" phrasing (the CA profession is
  the trusted reference point; align with it, never against it).
- **UK:** "Not regulated financial advice (FCA)"; HMRC non-affiliation; use HMRC's own terms
  ("take-home pay", "personal allowance") descriptively without implying endorsement.
Claiming-Age-grade copy audits apply to every pension/claiming app in every country.

## 4. Growth playbook deltas

- **Channels:** each country has one dominant community that plays the Bogleheads role:
  r/PersonalFinanceCanada (very large, tool-friendly), r/IndiaInvestments +
  r/personalfinanceindia, r/UKPersonalFinance (very large, has strict tool rules — read them).
  The playbook's participate-first rule matters doubly in these; each country plan names the
  secondary channels.
- **Pricing anchors (one-time Pro, playbook §8 model unchanged):** Canada C$6.99–C$12.99;
  UK £4.99–£8.99; India ₹199–₹499 (price for the market — a US$7 one-time is a non-starter;
  volume is the model there). Free-at-launch portfolio decision unchanged.
- **Platform priority:** India is Android-first (build/verify Play first, iOS follows);
  Canada/UK match the US iOS-lean.
- **`quiet-site`:** country pages under the same umbrella domain (`/ca/paycheque`, `/in/in-hand`)
  — shared authority beats per-country domains, same reasoning as playbook §6. English-first
  everywhere including India (the target segment searches in English); Hindi metadata is a
  later experiment, not a launch requirement.

## 5. Country selection & sequencing

Ranked by (size of the underserved question × strength of the community channel × data
availability): **Canada first** (published CRA payroll formulas are a gift of an oracle, and
"when to take CPP" is a perennial lead-gen-infested question), **India second** (the single
biggest gap-question in the set — CTC vs in-hand — and the largest audience, Android-first),
**UK third** (the £100k trap cluster is uniquely well-shaped for Headroom's approach).

Within each country: ship the flagship first (it's chosen for ASO pull), then wave-2 ports.
Do not start a second country until the first country's flagship is live — the annual
tax-data update burden compounds per country, and each country's January/April/March update
season must be survivable (the runbooks are the constraint, not the engines).

## 6. Evaluated, deferred

- **Australia** (take-home + super + HECS/HELP; negative-gearing rent-vs-buy) — strong fit,
  good community (r/AusFinance); deferred only for update-burden reasons. Next after UK.
- **Germany/EU** — Lohnsteuer complexity is high and the advice-regulation environment is
  stricter; needs its own investigation before planning.
- **Quebec-specific depth** (QPP/QPIP/Revenu Québec) — planned as phase 2 inside the Canada
  repo, not a separate product; the Canada plan flags every QC divergence.
