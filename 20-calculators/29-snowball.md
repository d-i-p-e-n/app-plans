# Snowball — Plan

**One sentence:** A debt-payoff planner that shows snowball vs avalanche with real numbers and a
debt-free date — and never, ever tries to sell you a consolidation loan.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** the ~half of US card holders carrying revolving balances, plus anyone juggling
  car/student/personal loans. Enormous, stressed, and preyed upon: every debt calculator online
  is a funnel for consolidation loans or debt-settlement services.
- **Gap:** the honest tool is undebt.it (web, dated) or a spreadsheet. A private, offline,
  respectful mobile planner with the two-strategy comparison done fairly doesn't exist without
  ads or lead-gen.
- **Tone rule (this app's equivalent of a compliance gate):** never shame, never moralize.
  The user arrives stressed; the app is a calm planner, not a judge. The behavioral case for
  snowball (quick wins sustain motivation) is presented as respectfully as the math case for
  avalanche — both are legitimate, and we say so.

Non-goals: consolidation/refinance *offers* or referrals (the category's defining corruption —
never; we model an offer the user already has, we never source one), debt settlement anything,
credit-score features, bank linking (manual entry, family standard), budgeting (the extra-payment
number is an input, not something we police).

## 2. Engine (`packages/engine-snowball`)

Inputs: debts — name, type (card / store card / auto / student / personal / medical / other),
balance, APR, minimum payment (entered, with the per-type "how minimums typically work" helper),
promo-APR terms where applicable (rate, expiry date, **deferred-interest flag** for store cards);
extra monthly budget; one-time windfalls (amount + date).

Outputs:
1. **Strategy comparison:** avalanche (APR-descending) vs snowball (balance-ascending) vs
   custom order: per-strategy debt-free date, total interest, and the honest delta sentence —
   "Avalanche saves $1,240 in interest; snowball clears your first debt 7 months sooner." No
   winner declared; the tradeoff is stated and the user chooses.
2. **The plan:** month-by-month schedule; "this month: minimums everywhere + $310 extra to
   {debt}" — one actionable line, recomputed as reality happens.
3. **Promo-APR cliff modeling:** 0% windows with expiry re-prioritization, and **deferred
   interest done right** (store-card retroactive interest if not cleared by the date — the
   nastiest consumer trap in the category, almost never modeled; clearing-by-cliff gets
   priority weighting and an explicit warning).
4. **Minimum-only mirror:** the CARD-Act-style "minimums only: 24 years, $19,000 interest"
   line — the statement-box reality, shown once at setup, never repeated as a nag.
5. **Consolidation check (defensive tool):** user enters an offer they received (amount, APR,
   term, origination fee) → matched-horizon comparison against their current plan, including
   the "freed-up cards get re-spent" risk sentence (behavioral honesty, one line, not a
   lecture).
6. **Windfall slider:** "$1,000 hits in March → debt-free 4 months sooner."

Oracles: hand-built amortization spreadsheets (multi-debt, both strategies, promo cliffs) in
`docs/oracles/`; CFPB minimum-payment worked examples. Goldens ≥60: deferred-interest cliff hit
vs cleared, promo expiry mid-plan re-sort, debt paid off mid-month rollover ("snowball rolls"),
minimum > interest-only edge, zero-extra-budget plans (minimums only — must render kindly),
windfall exactly clearing a debt.

## 3. Screens

- `/(onboarding)`: family disclaimer + the tone promise ("No judgment. No loan ads. Just the
  plan.") → add debts (fast entry, ~30 s each) → extra-budget slider → the comparison. Under
  4 minutes to a debt-free date.
- `/` **Plan:** debt-free date hero, this-month action line, progress bar (paid vs original
  total — always framed as progress made, never remaining shame), next-milestone line ("Visa
  gone in ~3 months").
- `/compare`: the two-strategy table + delta sentences; custom-order editor (drag).
- `/debts` + `/debt/[id]`: list with per-debt payoff dates; detail with its schedule and
  promo-cliff warnings.
- `/log`: monthly "I paid it" confirmations (one tap when on-plan; adjustable when life
  happened — re-plan without comment); payment history.
- `/whatif`: windfall + extra-budget sliders; consolidation check.
- `/settings`: disclaimers, notification prefs, export seam.

Local notifications: monthly plan reminder (opt-in, 1/month, the action line in the copy) and
promo-APR cliff warnings (30/7 days — genuinely valuable, on by default with per-debt toggle).
Nothing else; a debt app that nags is a debt app that gets deleted.

## 4. Phases & acceptance criteria

1. **Engine:** both strategies + rollover math + promo/deferred-interest cliffs; oracle
   spreadsheets to the cent; goldens.
2. **App:** 4-minute onboarding measured; Plan/Compare/Debts/Log; re-plan flow (missed month →
   new plan, zero guilt copy verified in copy audit).
3. **What-ifs:** windfall + consolidation check with matched-horizon test cases.
4. **Notifications + tone audit:** monthly reminder and cliff warnings E2E; full-app copy
   audit against the tone rule (Claiming Age-style gate — every string).
5. **Release:** EAS, listing (§5), "no data collected."

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Snowball: Debt Payoff Plan
- **iOS subtitle:** Avalanche vs snowball, honest
- **iOS keyword field:** debt,credit card,calculator,free,interest,loan,budget,payment,tracker,student,payoff date
- **Play title:** Snowball: Debt Payoff Plan
- **Play short description:** Snowball vs avalanche with real numbers. Debt-free date, no loan ads.
- **Keyword targets:** primary "debt payoff planner", "debt snowball calculator"; long-tail "snowball vs avalanche which is better", "0% apr deferred interest".
- **Play long description — first two lines:** "Every debt calculator online wants to sell you a consolidation loan. Snowball just builds the plan: avalanche vs snowball with real numbers, a debt-free date, promo-APR cliff warnings, and one monthly action line — private, offline, and judgment-free."
- **Screenshot story:** debt-free date hero → the two-strategy comparison with delta sentences → deferred-interest cliff warning → "no loan ads, no judgment" stance shot.
- **Launch channels:** r/debtfree (the debt-free-date and milestone screenshots are that community's native content — the app is built for its share culture), r/personalfinance, r/povertyfinance (respectful, critique-first), budgeting YouTube/podcast audiences skeptical of Ramsey-branded paid tools.
- **Review prompt moment:** after the third on-plan monthly payment logged (habit + progress). Excluded: first session and any re-plan-after-missed-month session.
- **Pro candidates & anchor:** what-if scenario packs, CSV/PDF export, multi-plan (couples tracking separately); one-time $5.99. **Debt count stays unlimited free forever** — capping debts in a debt app is hostile; note this as a charter line.
- **Web/SEO queries:** "debt snowball vs avalanche calculator", "debt payoff planner no signup", "store card deferred interest trap calculator", "debt free date calculator". The deferred-interest explainer is the link-magnet article.

## 6. Risks

- Tone failure is product failure — the copy audit is a hard gate; one shaming string undoes
  the positioning.
- The consolidation check must stay defensive (modeling their offer) — any future "compare
  offers" feature that sources offers is the corruption this app exists to reject; charter line.
- Minimum-payment mechanics vary by issuer (percent-of-balance floors) — the per-type helper
  plus user-entered minimums keeps us honest; never auto-compute a minimum and present it as
  fact.
