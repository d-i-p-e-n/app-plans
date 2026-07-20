# Calculators — UK (`calculators-uk`) — Plan

Read [00-intl-overview.md](00-intl-overview.md) first. This document specs the UK lineup: each
app, its deltas from the US sibling, and country-specific engine/data/ASO inputs. Where a
section is silent, the corresponding US plan applies. UK tax years run **6 April – 5 April**
(the `TaxYear` abstraction handles it; every screen labels years as "2026/27"). All values
indicative — verify against current GOV.UK/HMRC pages at build time.

**Lineup (build order): Take-Home → Cliffs → Remortgage**, then wave-2 (§5).

---

## 1. Take-Home (flagship) — US sibling: [Paycheck What-If](../20-calculators/22-paycheck-whatif.md)

**One sentence:** Real UK take-home for any salary, raise, or offer — income tax, NI, student
loan plans, and pension sacrifice, with Scotland done properly.

- **Why flagship:** "take home pay calculator" is a massive evergreen UK query served by
  ad-saturated sites; the differentiators are the pieces they fudge — **student loan plans**
  (Plan 1/2/4/5 + postgraduate, each with its own threshold and rate, stackable), **Scottish
  income tax** (different bands — most calculators quietly ignore Scotland; supporting it
  properly is both correctness and an underserved-audience wedge), and **salary sacrifice**
  modeled as the take-home lever it actually is.
- **Engine (`engine-takehome`):**
  - Income tax: rUK bands + Scottish bands (data-driven, selected by "where do you live");
    personal allowance with the **£100k taper** (the 60% effective zone — shared machinery
    with Cliffs, one package).
  - National Insurance: employee Class 1 with thresholds; directors' annualized method
    Phase 2.
  - Student loans: plan picker (multi-select — Plan 2 + postgrad together is common),
    per-plan thresholds/rates, the "9% above threshold" mechanics shown per paycheque.
  - Pension: auto-enrolment percentages, relief-at-source vs net-pay vs **salary sacrifice**
    (with employer NI passthrough note where offered) — the three methods confuse everyone;
    showing the same contribution under each is a hero explainer.
  - Bonus months, tax-code adjustment (default 1257L-class assumption, editable with a plain
    "what your tax code means" helper — no code-parsing rabbit hole in MVP).
- **Oracles:** HMRC published rates and worked examples; cross-check against HMRC's own
  estimator documented in `docs/oracles/`. Goldens ≥80: Scotland vs rUK at every band edge,
  taper zone entry/exit, each student-loan plan and stacked plans, sacrifice vs
  relief-at-source equivalence cases, week-1/month-1 vs cumulative basics.
- **ASO & adoption:**
  - iOS name: `Take-Home: UK Salary` · subtitle: `Tax, NI, student loan, real`
  - Keyword field: `take home,pay,salary,calculator,tax,ni,student loan,pension,scotland,paye,net`
  - Play title: `Take-Home: UK Salary Calc` · short: `Real UK take-home: tax, NI, student
    loans, pension sacrifice. Offline, no ads.`
  - Long-description opener: "What does that offer actually pay each month? Take-Home does UK
    pay properly — income tax (Scotland included), National Insurance, every student loan
    plan, and pension sacrifice — with every line shown and nothing sold."
  - Channels: r/UKPersonalFinance (very large; strict rules — participate first),
    r/UKJobs offer threads, MoneySavingExpert-forum-adjacent audiences, graduate-season
    timing (Sep–Oct: first payslips confuse a whole cohort annually).
  - Review moment: compare view with a second scenario. Pro: >3 scenarios, directors'
    NI, CSV/PDF; £5.99.

## 2. Cliffs — US sibling: [Headroom](../20-calculators/26-headroom.md)

**One sentence:** The £100k trap, the child-benefit clawback, and the childcare cliff — how
close you are to each, and what salary sacrifice does about it, shown not sold.

- **Why it's the strongest Headroom translation anywhere:** the UK system is *made of cliffs*,
  they're household names, and the mitigation lever (pension salary sacrifice) is legal,
  universal, and deterministic. "Should I sacrifice below £100k" threads run daily on
  r/UKPersonalFinance.
- **Engine (`engine-cliffs`):**
  - **Personal-allowance taper** (£100k–£125,140-class zone): the 60% effective marginal band,
    rendered as Headroom's marginal-rate-per-next-pound curve.
  - **Free childcare / tax-free childcare eligibility cliff at £100k adjusted net income** —
    for parents of nursery-age kids this cliff is worth **thousands per year and is binary**;
    the "one pound over costs £X of childcare support" rendering is the single most shareable
    artifact in the UK lineup.
  - **HICBC** (child-benefit clawback band) with per-child amounts.
  - Pension annual allowance + the high-income taper; carry-forward basics Phase 2.
  - **The sacrifice solver:** "sacrificing £N gets your adjusted net income to £99,900 —
    keeping childcare eligibility and taper-free allowance; net cost of that sacrifice after
    relief: £M." Framed as arithmetic on stated thresholds — the Headroom/Room compliance
    line (never "you should sacrifice") audited hardest here because the arithmetic is so
    close to advice; the copy shows *what the thresholds do*, the user decides.
  - Adjusted-net-income computation done properly (gift aid, pension methods) — it's the
    input every cliff keys on and the thing people get wrong.
- **Oracles:** GOV.UK worked examples for taper/HICBC/childcare eligibility; hand-derived
  sacrifice cases. Goldens: every cliff at ±£1, stacked cliffs (childcare + taper together),
  each pension method's effect on adjusted net income.
- **ASO:** iOS name `Cliffs: UK Tax Traps` · subtitle `£100k, childcare & HICBC` · keywords:
  `100k,tax trap,childcare,child benefit,salary sacrifice,pension,allowance,taper,marginal,hicbc` ·
  Play short: `How close you are to the £100k trap & childcare cliff — and what sacrifice
  does.` Long-description opener: "Earn near £100k with kids in nursery? One pound can cost
  you thousands. Cliffs shows every UK tax cliff — the personal-allowance taper, the childcare
  cliff, the child-benefit clawback — and exactly what pension sacrifice does to your distance
  from each." Channels: r/UKPersonalFinance (this app is purpose-built for its daily £100k
  threads), r/HENRYUK (precisely the demographic), parenting-finance newsletters. Review:
  second scenario compare; excluded within a session that revealed a newly-crossed cliff.
  Pro: carry-forward module, couple view, >3 scenarios; £7.99.

## 3. Remortgage — US sibling: [Payoff](../20-calculators/27-payoff.md) (diverged like Canada's Renewal)

**One sentence:** Fix-expiry shock, overpayment allowances, and ERC math — UK mortgages as
they actually work, with no broker funnel.

- **Engine (`engine-remortgage`) deltas:** short fixes (2/5-year) against long terms — the
  **fix-expiry payment shock** view (Renewal's hero screen, UK-parameterized: "your 1.2% fix
  ends in 8 months; at 4.8% the payment goes from £980 to £1,410"); overpayment allowances
  (typically 10%/year of balance) with allowance-vs-ERC boundary warnings; **ERC (early
  repayment charge)** percentage schedules by year-of-fix; product-fee vs rate tradeoff
  comparison at matched horizons (the fee-loaded "low rate" trick — Payoff's matched-horizon
  discipline pointed at the UK's version of it); offset mortgages Phase 2; invest-instead
  comparison carried over.
- **Goldens:** ERC schedule boundaries, allowance-reset dates (calendar vs product year —
  lender-dependent, user-selected), fee-vs-rate crossovers, expiry-shock at revert (SVR) vs
  new-fix rates.
- **ASO:** iOS name `Remortgage: Fix & Overpay` · subtitle `Expiry shock & ERC math` ·
  keywords: `mortgage,calculator,fix,rate,overpayment,erc,remortgage,payment,shock,fee` · Play
  short: `Fix ending? See the payment shock, overpayment room & ERC math. No broker funnel.`
  Channels: r/UKPersonalFinance + r/HousingUK remortgage-wave threads (fix-expiry cohorts
  renew the audience continuously), MSE-forum-adjacent content. Review: after saving a
  remortgage comparison. Pro: multiple properties, offset module; £5.99.

## 4. Repo notes

`calculators-uk` mirrors the US repo. `tax-data` structure: `y2026_27/income-tax.ts` (rUK +
Scotland bands), `y2026_27/ni.ts`, `y2026_27/student-loans.ts` (per-plan thresholds/rates),
`y2026_27/pensions.ts` (AA, taper), `y2026_27/cliffs.ts` (taper thresholds, HICBC band,
childcare eligibility rules). Annual runbook keyed to the Autumn Budget/Spring Statement and
the April 6 year rollover — **the UK update lands mid-April, offset from Canada's January and
India's February**, which is exactly the staggering that makes the multi-country maintenance
season survivable (overview §5).

## 5. Wave 2 (brief)

- **Snowball UK** — near-verbatim port; UK debt landscape framing (overdrafts, credit cards);
  channels r/UKPersonalFinance + debt-support communities (tone audit re-run; UK debt-charity
  ecosystem, e.g. StepChange, is the referral norm — link the charity, never a consolidator).
- **Rent or Buy UK** — deltas: stamp duty (SDLT bands incl. first-time-buyer relief),
  leasehold service charges (a UK-specific cost line generic tools omit), no
  mortgage-interest relief for owner-occupiers, Help-to-Buy-ISA/LISA bonus modeling.
- **State Pension year checker** — deliberately *not* planned as an app: the real answer
  requires the user's NI record from GOV.UK; a calculator without it would be guesswork. A
  `quiet-site` explainer page pointing at the official forecast tool serves the query
  honestly instead.
