# Paycheck What-If — Plan

**One sentence:** Model a raise, bonus, 401k change, or new job offer and see the real take-home
delta — without landing on a lead-gen site.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first.

## 1. Product

- **Audience:** every W-2 employee at the moments that matter: job offer in hand, raise
  conversation, open enrollment, bonus season, moving states. Universal, recurring, and currently
  served by SmartAsset/ADP-style pages whose business is selling the user's intent.
- **Core jobs:** (1) "Offer says $145k in Denver vs my $130k in Chicago — what's the actual
  monthly difference?" (2) "If I bump 401k from 6% to 10%, what does my paycheck drop by?"
  (3) "Why was my bonus taxed so hard, and will I get it back?" (4) "What does this HSA/insurance
  election really cost per check?"
- **Differentiator:** side-by-side scenario comparison with an honest, expandable breakdown of
  every line — and it works in airplane mode.

Non-goals: tax *filing* estimation (refund calculators — adjacent but different product; the
bonus-withholding view explains over-withholding qualitatively + roughly, that's the boundary),
self-employment/1099 (Phase 7 — big; quarterly estimates are a worthy sibling product), hourly
overtime modeling beyond simple hourly×hours (Phase 6).

## 2. Engine (`packages/engine-paycheck`)

Inputs: pay basis (salary annual or hourly+hours), pay frequency (weekly/biweekly/semimonthly/
monthly), filing status, state (+ locality for the flat-local launch set: NYC, Philadelphia),
W-4 step entries (dependents credit, extra withholding, other income/deductions), pre-tax
deductions (401k %/$, HSA, FSA, Section 125 premiums), Roth 401k, post-tax deductions, YTD
figures (for SS wage base + additional-Medicare correctness mid-year), bonus events (amount,
method: aggregate vs flat supplemental).

Outputs per scenario: per-paycheck and annual: gross → each pre-tax deduction → federal income
tax withholding (Pub 15-T percentage method, current W-4) → Social Security (to wage base) →
Medicare (+0.9% additional over threshold) → state income tax → local (launch set) → post-tax →
**net**. Plus: effective vs marginal rate, employer-match capture note (if match % entered,
"you're leaving $X of match on the table" when under-contributing — factual, not advice).

Delta view: any two scenarios line-by-line with differences highlighted; the headline is
"$ per paycheck" not annual (that's how people feel money).

**State strategy (the honest hard part):**
- Launch tier: the `tax-data` 10 states (family overview) with full progressive/flat withholding
  formulas, each with oracle tests from that state's official withholding tables.
- Every other state: clearly labeled approximation using annualized bracket math where the state
  publishes brackets, with an "approximate" badge on the state line, or "not yet supported"
  (pick per state during implementation; never silently wrong). Additional exact states added
  data-only (no engine changes) — that's the `tax-data` design test.

Oracles: IRS Pub 15-T worked examples (federal, multiple W-4 configurations); each launch
state's published withholding-table examples; ADP/Paychex cross-checks recorded in
`docs/oracles/` (as manual verification notes, not scraped).

Goldens: ≥80 scenarios — every frequency, W-4 variants, mid-year YTD crossovers (SS base,
additional Medicare), bonus aggregate vs flat at the $1M supplemental boundary, 401k hitting the
annual limit mid-year, semimonthly rounding.

## 3. Screens

- `/(onboarding)`: disclaimer → guided current-paycheck setup (offer to start from a recent
  paystub: "enter gross and we'll estimate the rest, then tune until net matches") → done. The
  "tune until it matches your real stub" step is the trust-builder.
- `/` **My Paycheck:** the current scenario's per-check breakdown as a vertical waterfall
  (gross at top, net at bottom, each line tappable for method + citation).
- `/scenarios`: list, duplicate, edit; the **Compare** view (two columns + delta column) is the
  hero screen — screenshot it for the store.
- `/bonus`: standalone bonus modeler: amount + method → withholding now, rough true-tax note,
  "why so much was withheld" explainer paragraph (plain language, cited).
- `/settings`: tax year banner, state coverage list with exact/approximate badges, disclaimers,
  export seam.

## 4. Phases & acceptance criteria

1. **Engine federal:** Pub 15-T implementation + FICA + all oracle tests green; frequency and
   YTD edge goldens.
2. **Engine states:** 10 launch states exact w/ per-state oracle tests; approximation path +
   badging logic for ≥25 more; unsupported-state UX defined.
3. **App:** onboarding with stub-matching flow, waterfall, scenarios + compare, bonus modeler.
4. **Validation pass:** manual cross-check of 20 scenarios against two commercial paycheck
   calculators; discrepancies explained or fixed; notes in `docs/oracles/validation-2026.md`.
5. **Release:** EAS, listing, "no data collected."

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Paycheck What-If
- **iOS subtitle:** Real take-home, no lead-gen
- **iOS keyword field:** salary,calculator,take home,net pay,401k,bonus,withholding,offer,raise,hourly,w4,wage
- **Play title:** Paycheck What-If Calculator
- **Play short description:** Model raises, offers, 401k & bonuses. Real take-home math. Offline & private.
- **Keyword targets:** primary "paycheck calculator", "take home pay"; long-tail "job offer take home comparison", "bonus tax calculator".
- **Play long description — first two lines:** "Every paycheck calculator online wants to sell your intent to a lender. This one just answers the question: model a raise, a job offer in another state, a 401k bump, or a bonus, and see the real per-paycheck difference — with every line of the math shown, offline."
- **Screenshot story:** compare view (offer vs current, delta column) → 401k bump per-check delta → "why your bonus was taxed 40%" explainer → airplane-mode/private framing.
- **Launch channels:** r/personalfinance, r/careerguidance, r/jobs (offer-season threads), Show HN; short-video explainers ("why your bonus is taxed 40%") have proven viral history in this niche.
- **Review prompt moment:** after opening the compare view with a second saved scenario (planning engagement).
- **Pro candidates & anchor:** states beyond the exact-tier launch set, >3 scenarios, CSV/PDF export; one-time $6.99.
- **Web/SEO queries:** "job offer take home pay comparison calculator", "how much will my paycheck change if I increase 401k", "bonus withholding aggregate vs flat method", "paycheck calculator without ads or signup".

## 6. Risks

- State withholding is a maintenance treadmill — the runbook + data-only-state-additions design
  is the mitigation; scope discipline on the launch tier.
- Users will compare against their actual stub and find employer-specific lines (imputed income,
  garnishments) — support generic "other pre-tax/post-tax" line items so any stub can be matched.
- Semimonthly/rounding discrepancies vs payroll providers are inevitable at the cents level —
  state the tolerance honestly in-app ("within a few dollars of your stub; payroll providers
  round differently").
