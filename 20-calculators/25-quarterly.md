# Quarterly — Plan

**One sentence:** Know exactly what to send the IRS each quarter as a freelancer — safe-harbor
math, deadlines, and a per-invoice set-aside percentage — without panic or a CPA upsell.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Build **after Paycheck What-If** —
it reuses that engine's federal machinery (brackets, FICA thresholds via `tax-data`).

## 1. Product

- **Audience:** freelancers, contractors, gig workers, solo consultants — tens of millions,
  growing, and chronically anxious about estimated taxes. Also W-2 + side-income people who
  just got their first 1099 surprise.
- **Gap:** incumbents bundle this into paid bookkeeping suites (QuickBooks SE-class,
  subscription) or CPA lead-gen calculators. The actual recurring question — "how much do I
  set aside and what do I pay on the next deadline?" — deserves a focused, offline, private
  tool.
- **Core jobs:** (1) "What should Q3's payment be, given what I've actually earned?" (2) "Am I
  covered by safe harbor if I just match last year?" (3) "What % of each invoice should I set
  aside?" (4) "Don't let me miss a deadline." (5) "I'm behind — how bad is it?"

Non-goals: bookkeeping/expense tracking (users enter net self-employment income; receipts live
elsewhere), invoicing, actual payment execution (we deep-link to IRS Direct Pay / EFTPS and
state portals — never handle money, per charter), S-corp payroll planning (Phase 7), tax
*filing*.

## 2. Engine (`packages/engine-quarterly`)

Inputs: filing status; state (launch states per family overview); prior-year AGI and total tax
(for safe harbor); YTD net SE income (simple quarterly or monthly entries) + projection for the
rest of the year (flat, or user-adjusted per quarter); W-2 income + withholding YTD (spouse or
day-job — withholding counts as paid evenly, a rule most people don't know and we exploit
honestly); pre-payments already made.

Outputs:
1. **SE tax:** 92.35% × net SE × 15.3% with the Social Security wage-base interaction against
   W-2 wages (order matters; oracle-tested), half-SE deduction, Medicare additional 0.9%.
2. **Income tax estimate:** on projected AGI (standard deduction default, QBI 20% simplified
   with the taxable-income limit; the phase-out band for specified services is Phase 2 — until
   then, band incomes show a clearly labeled range).
3. **The recommendation:** per remaining quarter, the payment under (a) prior-year safe harbor
   (100% / 110% if AGI > $150k) and (b) 90%-of-current-year — presented side by side with
   "lowest legally safe payment" highlighted and the tradeoff explained in one sentence
   (safe harbor = certainty; current-year = better cash flow if income dropped).
4. **Set-aside rate:** live "% of each dollar you invoice" figure combining SE + income tax at
   the projected margin — the number freelancers actually pin to their monitor.
5. **Behind? Underpayment estimate** via the Form 2210 short method at current IRS interest
   rates (a `tax-data` quarterly-updated constant), framed calmly: "≈ $34/month of delay —
   fixable, here's the catch-up payment."
6. **Deadlines:** Apr/Jun/Sep/Jan-15 schedule with weekend/holiday rolls (`finmath`), plus
   launch-state schedules (several states diverge — data, not code).

Oracles: IRS Form 1040-ES worksheet worked examples; Pub 505 examples; Schedule SE examples;
the W-2 + SE wage-base interaction hand-derived in `docs/oracles/`. Goldens ≥60: safe-harbor
110% threshold crossing, wage base straddles, QBI limit binding, mid-year start (first
freelance income in August — Q3/Q4 only), joint filers with mixed W-2/SE.

Phase 2: **annualized income installment method** (Form 2210 Schedule AI) — the killer feature
for lumpy income ("I earn everything in Q4"); complex, ship only with full oracle coverage.

## 3. Screens

- `/(onboarding)`: family disclaimer → three-question setup (filing status, last year's tax,
  what you've earned so far) → instant first recommendation. Under 2 minutes to a number.
- `/` **This Quarter:** the hero card — "Send $2,340 by Sept 15", safe-harbor vs current-year
  toggle, "mark as paid" (logs payment, updates everything), deep link to IRS Direct Pay and
  the state portal. Below: set-aside rate card and YTD progress bar (paid vs required-to-date).
- `/income`: quarterly/monthly income entries + projection editor; sliders for "rest of year"
  scenarios.
- `/year`: all four deadlines with status (paid ✓ / upcoming / behind), the catch-up view when
  behind, year-end projection summary.
- `/scenarios`: family-standard compare (e.g., "big client lands" vs "current pace").
- `/settings`: tax year banner, state coverage badges, payment history log, disclaimers,
  export seam.

Local notifications (via the same scheduler pattern as Ladder): deadline − 14 days and − 3 days
with the current computed amount in the copy; "mark as paid" cancels the pair. Nothing else.

## 4. Phases & acceptance criteria

1. **Engine core:** SE tax + income projection + both payment methods + deadline math; oracles
   green; wage-base interaction goldens.
2. **App:** onboarding-to-number < 2 min; This Quarter card; income editor; payment log;
   notifications E2E (device, app killed, reboot reconcile).
3. **Underpayment + states:** 2210 short method; launch-state schedules/rates; behind-state UX.
4. **Validation:** 15 scenarios cross-checked against 1040-ES worksheets by hand; recorded in
   `docs/oracles/validation-2026.md`.
5. **Release:** EAS, listing (§6), "no data collected."

## 5. Risks

- QBI complexity creep — the simplified-with-labeled-range approach is the scope wall until
  Phase 2; never silently approximate inside the band.
- IRS interest-rate constant goes stale — quarterly `tax-data` update note in the annual
  runbook (this family's only intra-year data dependency besides Ladder's holiday table).
- Users entering gross instead of net SE income is the classic error — the income editor asks
  "after business expenses?" inline with a one-tap explainer.

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Quarterly: 1099 Tax Planner
- **iOS subtitle:** Estimated taxes, no panic
- **iOS keyword field:** freelance,self employed,estimated,irs,1099,gig,contractor,safe harbor,side hustle,payment
- **Play title:** Quarterly: 1099 Tax Planner
- **Play short description:** Know exactly what to pay the IRS each quarter. Safe-harbor math. Offline & private.
- **Keyword targets:** primary "quarterly taxes", "estimated tax calculator"; long-tail "how much to set aside for taxes 1099".
- **Play long description — first two lines:** "The freelancer question, answered: how much do I send the IRS this quarter? Safe-harbor and 90% methods side by side, a set-aside % for every invoice, and deadline reminders — no subscription bookkeeping suite required."
- **Screenshot story:** "Send $2,340 by Sept 15" hero card → set-aside % card → behind-but-fixable view → deadline reminder on lock screen.
- **Launch channels:** r/freelance, r/tax (helpful-answer presence first), r/WorkOnline, creator-economy newsletters, indie-hacker communities (X/Bluesky), Show HN (fits: solo devs are the audience).
- **Review prompt moment:** after the user marks their first quarterly payment as paid (relief + competence). Excluded: any behind/underpayment context.
- **Pro candidates & anchor:** annualized-income method (Schedule AI), multi-state, >3 scenarios; one-time $7.99.
- **Web/SEO queries:** "how much should I set aside for taxes freelance", "quarterly estimated tax calculator free", "safe harbor rule estimated taxes", "missed quarterly tax payment what now".
