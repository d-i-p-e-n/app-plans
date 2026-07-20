# Calculators — Australia (`calculators-au`) — Plan

Read [00-intl-overview.md](00-intl-overview.md) first. This document specs the Australian
lineup: each app, its deltas from the US sibling, and country-specific engine/data/ASO inputs.
Where a section is silent, the corresponding US plan applies. Australian tax years run
**1 July – 30 June** (labeled "2026–27" in all copy; the `TaxYear` abstraction handles it) —
the update season lands around the May Federal Budget and the 1 July rollover, staggered
neatly against Canada (January), India (February), and the UK (April). All parameter values
are indicative — verify against current ATO/GOV.AU pages at build time; the HECS/HELP system
in particular was reformed recently (§1) and must be re-checked.

**Lineup (build order): Take-Home → Cap Room → Offset**, then wave-2 (§5).
**Sequencing:** fourth country, after the UK flagship is live (overview §5).

---

## 1. Take-Home (flagship) — US sibling: [Paycheck What-If](../20-calculators/22-paycheck-whatif.md)

**One sentence:** Real Australian take-home for any salary, offer, or sacrifice change —
income tax, Medicare levy, HELP repayments, and super, with every line shown.

- **Why flagship:** "pay calculator" and "HECS repayment" are enormous evergreen Australian
  queries, served today by ad-supported sites. The differentiators are the pieces generic
  tools fudge: **HELP/HECS repayment done right under the reformed system**, the Medicare
  levy surcharge tiers, and salary sacrifice modeled as the lever it is.
- **Engine (`engine-takehome-au`):**
  - Income tax per current resident brackets + LITO (low income tax offset) taper;
    non-resident and working-holiday schedules Phase 2 (flagged honestly in-app).
  - **Medicare levy** (2%) with the low-income reduction band, and **Medicare levy
    surcharge** tiers for those without private hospital cover — the "should I get private
    cover for tax reasons" arithmetic shown factually (surcharge cost vs typical premium is
    a user-entered comparison, never a recommendation).
  - **HELP/HECS:** the repayment system was reformed effective 2025–26 (higher threshold,
    marginal-style repayment rates, plus the one-off debt reduction) — encode the *current*
    system from the ATO/StudyAssist pages at build time, with the old system's tables kept in
    `tax-data` history for prior-year views. Show repayment per pay cycle and the
    "repayment vs indexation" honesty view (is the balance actually shrinking this year?) —
    a question every graduate asks and no payslip answers.
  - **Superannuation:** employer SG (12% from 1 July 2025 — verify) shown explicitly
    (package vs base-plus-super offer confusion is Australia's CTC-illusion analog — the
    "is that $120k including super?" decomposition is a hero explainer), plus salary-sacrifice
    contributions with their contributions-tax (15%) treatment vs take-home cost.
  - Pay cycles (weekly/fortnightly/monthly — fortnightly is the Australian norm), bonus
    withholding schedules.
- **Oracles:** ATO's published withholding schedule formulas (the NAT-series schedules are
  published as formulas — encode them, like Canada's T4127) and the ATO simple tax
  calculator as the documented cross-check. Goldens ≥80: bracket edges, LITO taper, levy
  reduction band, MLS tiers, each HELP threshold/rate boundary, sacrifice-vs-cash
  equivalence, fortnightly rounding.
- **ASO & adoption:**
  - iOS name: `Take-Home AU: Pay + HECS` · subtitle: `Tax, Medicare, super, real`
  - Keyword field: `pay,salary,calculator,tax,hecs,help,super,ato,net,wage,fortnightly`
  - Play title: `Take-Home AU: Pay & HECS` · short: `Real Aussie take-home: tax, Medicare
    levy, HELP repayments, super. No ads.`
  - Long-description opener: "Is that $120k package including super? What does the new HECS
    system actually take each fortnight? Take-Home does Australian pay properly — every tax,
    levy, and repayment shown line by line, offline and private."
  - Channels: r/AusFinance (the channel — very large, tool-friendly within its rules),
    r/AusHENRY, graduate-season timing (Feb–Mar first payslips), offer-season threads.
  - Review moment: compare view with a second scenario. Pro: >3 scenarios, non-resident
    schedules, CSV/PDF; A$9.99.

## 2. Cap Room — US sibling: [Headroom](../20-calculators/26-headroom.md)

**One sentence:** How much more you can put into super this year — concessional caps,
carry-forward, and the Division 293 cliff — shown, not sold.

- **Why it's the Headroom translation:** "how much extra can I salary-sacrifice into super"
  is r/AusFinance's perennial thread, the rules interact (cap + carry-forward + Div 293),
  and the answer-space is superannuation-fund marketing and advisor funnels.
- **Engine (`engine-caproom`):**
  - **Concessional cap** tracking: SG + sacrifice + personal deductible contributions
    against the annual cap, with YTD entry ("what's gone in so far this FY").
  - **Carry-forward:** unused concessional cap from the prior five years, usable while total
    super balance < the threshold (~$500k at prior 30 June — verify) — the table view of
    "your usable carry-forward by year" is the hero artifact; users reconstruct this from
    MyGov screenshots today.
  - **Division 293:** the extra 15% contributions tax when income + concessional
    contributions exceed the threshold ($250k-class — verify) — the Australian cliff analog,
    rendered with Headroom's marginal-rate-per-next-dollar discipline ("the next $10k of
    sacrifice is taxed at 15% in the fund; $4k later, Div 293 makes it 30%").
  - Non-concessional caps + bring-forward basics Phase 2; co-contribution and spouse-offset
    eligibility shown factually for low-income cases.
  - The sacrifice arithmetic: net take-home cost per $1,000 sacrificed at the user's
    marginal rate vs the 15% contributions tax — factual comparison, assumptions visible,
    never "you should sacrifice" (overview §3; the copy audit is strictest here, exactly
    like the UK's Cliffs).
- **Oracles:** ATO worked examples for carry-forward and Div 293; hand-derived stacked
  cases in `docs/oracles/`. Goldens: cap boundary ±$1, carry-forward expiry ordering
  (oldest-first consumption), balance-threshold gating, Div 293 threshold straddles.
- **ASO:** iOS name `Cap Room: Super This Year` · subtitle `Caps, carry-forward, Div 293` ·
  keywords: `super,superannuation,salary sacrifice,concessional,contribution,carry forward,
  cap,retirement,division` · Play short: `Concessional cap, carry-forward & Div 293 — how
  much more fits into super.` Channels: r/AusFinance, r/fiaustralia (FIRE-adjacent — the
  carry-forward table is built for them), superannuation-literacy newsletters. Review:
  second scenario compare. Pro: couple view, multi-year planner; A$12.99.

## 3. Offset — US sibling: [Payoff](../20-calculators/27-payoff.md) (diverged like Canada's Renewal)

**One sentence:** Offset vs redraw vs extra repayments — the real math, including the
deductibility trap that bites future landlords.

- **Why diverged:** Australian mortgage mechanics center on **offset accounts** and
  **redraw** — variable-rate loans dominate, and the offset-vs-redraw choice is r/AusFinance's
  most repeated topic because the interest math is identical but the consequences aren't.
- **Engine (`engine-offset`):**
  - Core equivalence shown honestly: $50k in a 100% offset vs $50k paid in + redrawable —
    same interest saved (demonstrated, because half the audience doubts it), different
    liquidity and different tax future.
  - **The deductibility trap (the hero explainer):** if the home later becomes an investment
    property, prior extra repayments shrink the deductible loan balance while offset funds
    don't — the well-established mechanic rendered as a side-by-side future ("if you rent
    this place out in 2029…"), with "confirm with your accountant" framing (overview §3;
    factual mechanics, no tax advice).
  - Extra-repayment / offset-balance / rate-change what-ifs on variable loans; short fixed
    terms with revert-rate shock (the UK/Canada expiry-shock screen, smaller role); split
    loans (part fixed / part variable with offset on the variable — the common Australian
    structure) modeled first-class.
  - Invest-instead comparison carried from Payoff, with the offset's guaranteed
    after-tax-rate framing done correctly (offset interest saved is untaxed — the honest
    argument the app shows with visible assumptions).
- **Oracles:** hand-built daily-interest offset schedules to the cent (Australian loans
  accrue daily on the offset-net balance); published lender examples. Goldens: daily-accrual
  months, split-loan allocation, revert-rate shock, redraw-vs-offset equivalence proofs.
- **ASO:** iOS name `Offset: Mortgage & Redraw` · subtitle `The math, incl. the tax trap` ·
  keywords: `mortgage,offset,redraw,repayment,home loan,calculator,extra,interest,rate,split` ·
  Play short: `Offset vs redraw vs extra repayments — real math, incl. the deductibility
  trap.` Channels: r/AusFinance + r/AusProperty (the offset-vs-redraw threads are constant),
  first-home-buyer communities, mortgage-broker-skeptic content. Review: after saving an
  offset scenario. Pro: multiple loans, investment-conversion planner; A$9.99.

## 4. Repo notes

`calculators-au` mirrors the US repo. `tax-data` structure: `fy2026_27/income-tax.ts`
(brackets, LITO), `fy2026_27/medicare.ts` (levy, reduction band, MLS tiers),
`fy2026_27/help.ts` (current repayment system + historical tables), `fy2026_27/super.ts`
(SG rate, caps, carry-forward threshold, Div 293). Annual runbook keyed to the May Federal
Budget and 1 July rollover; HELP gets an explicit "system recently reformed — re-verify
structure, not just numbers" flag. Compliance wording per overview §3: "Educational
estimates from published ATO formulas. General information only — not financial or tax
advice; we hold no AFSL."

## 5. Wave 2 (brief)

- **PAYG Instalments** (Quarterly AU) — ATO instalment system for sole traders (rate vs
  amount methods, quarterly dates, variation rules); pairs with Take-Home for the
  freelancer audience.
- **Snowball AU** — near-verbatim port; channels r/AusFinance + Australian debt-support
  norms (link the National Debt Helpline, never a consolidator — same rule as the UK's
  StepChange line).
- **Rent or Buy AU** — deltas: stamp duty by state + first-home-buyer concessions, no
  owner-occupier interest deduction, LMI under 20% deposit, and the negative-gearing
  investment framing kept explicitly out of scope (owner-occupier decision only — the
  investment version is advice-adjacent and politically hot; a deliberate non-goal).
- **Age Pension timing** — deliberately *not* planned: pension age is fixed and the real
  question (means-tested Age Pension × super drawdown interaction) is deep retirement-advice
  territory; a `quiet-site` explainer pointing at official calculators serves it honestly
  instead (same reasoning as the UK State Pension non-app).
