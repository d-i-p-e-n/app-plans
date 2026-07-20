# Calculators — India (`calculators-in`) — Plan

Read [00-intl-overview.md](00-intl-overview.md) first. This document specs the Indian lineup:
each app, its deltas from the US sibling, and country-specific engine/data/ASO inputs. Where a
section is silent, the corresponding US plan applies. **Android-first market** (overview §4):
Play builds and testing lead; iOS follows. Currency formatting uses lakh/crore grouping
everywhere (₹12,50,000). All parameter values are indicative — verify against the current
Finance Act / CBDT publications at build time, and note that slabs/regime rules have changed
almost every year.

**Lineup (build order): In-Hand → Advance Tax → Prepay → FD Ladder**, then wave-2 (§6).

---

## 1. In-Hand (flagship) — US sibling: [Paycheck What-If](../20-calculators/22-paycheck-whatif.md)

**One sentence:** CTC to in-hand, honestly — every deduction shown, old vs new regime compared
with your actual numbers, offline and private.

- **Why flagship:** "CTC ₹18 LPA — what's my in-hand?" is arguably the single most-asked
  personal-finance question in India; every offer, every appraisal, every job switch. The
  answer-space is ad-saturated job portals and inconsistent blog tables. The regime choice
  (old vs new) renews the question annually for every salaried person.
- **Engine (`engine-inhand`):**
  - **CTC decomposition:** basic (typically 40–50% of CTC), HRA, special allowance, employer
    EPF contribution (inside CTC — the classic offer illusion, called out explicitly),
    gratuity accrual, variable pay (modeled as at-risk, shown separately — the second classic
    illusion), insurance premiums as CTC padding. The decomposition explainer is itself a
    hero feature: "why your ₹18 LPA CTC is not ₹1.5L/month."
  - **Deductions:** employee EPF (12% of basic, with the statutory-wage-ceiling option),
    professional tax (state table — small amounts, big credibility), TDS per the chosen
    regime.
  - **Old vs new regime comparison:** new regime slabs + standard deduction (the default
    regime since FY 2023-24); old regime with user-declared deductions — 80C basket (EPF
    counts toward it — commonly missed), 80D, home-loan interest under 24(b), and the **HRA
    exemption min-of-three formula** (metro/non-metro) done correctly, which almost no free
    calculator does. Output: "New regime: ₹X/month in-hand. Old with your declared
    deductions: ₹Y." — factual side-by-side, Paycheck's show-every-line discipline, no
    recommendation sentence (overview §3 compliance).
  - Cess (4%) and surcharge tiers at high incomes; marginal-relief edge at surcharge
    thresholds (golden-tested — the ±₹1 cliff behavior).
- **Oracles:** Income-tax-department worked examples; hand-derived HRA min-of-three cases;
  surcharge marginal-relief published examples. Goldens ≥80: regime crossovers at various
  deduction levels, HRA metro/non-metro, EPF ceiling on/off, variable-pay months, mid-year
  hikes (appraisal month changes the annualization — model it).
- **ASO & adoption:**
  - Play title: `In-Hand: Salary Calculator` · short: `CTC to in-hand, every deduction shown.
    Old vs new regime. Offline, no ads.` (Play-first per overview §4; iOS name `In-Hand
    Salary` · subtitle `CTC to take-home, honestly`.)
  - Keyword targets: "in hand salary calculator", "ctc to in hand", "old vs new tax regime
    calculator" — all enormous-volume Indian queries.
  - Long-description opener: "₹18 LPA CTC is not ₹1.5 lakh a month — and you deserve to see
    exactly why. In-Hand breaks your CTC into every real component, computes take-home under
    both tax regimes with your actual deductions, and never shows an ad or asks for your
    number."
  - ("never asks for your number" lands specifically in India, where every calculator site
    demands a phone number for lead-gen — that line is the local refusal-hook.)
  - Channels: r/IndiaInvestments and r/personalfinanceindia (tool-friendly, read rules),
    LinkedIn-adjacent job-switch content, offer-season timing (appraisal cycle Mar–May),
    fin-influencer YouTube (India's dominant channel — the CTC-illusion explainer is native
    video material).
  - Review moment: after comparing regimes with declared deductions (the "finally, clarity"
    moment). Pro: >3 scenarios, offer-compare view, PDF; ₹299 one-time.

## 2. Advance Tax — US sibling: [Quarterly](../20-calculators/25-quarterly.md)

**One sentence:** What to pay on each advance-tax date — including the 44ADA presumptive
option — with interest math if you're behind and zero CA-replacement pretensions.

- **Audience:** India's fast-growing freelancer/consultant class; the 44ADA presumptive
  regime makes their tax genuinely simple, and almost nobody explains it plainly.
- **Engine (`engine-advancetax`):** cumulative due-date schedule (15% by Jun 15, 45% by
  Sep 15, 75% by Dec 15, 100% by Mar 15); **44ADA presumptive** for specified professionals
  (50% of gross receipts deemed income, receipts ceiling with conditions — verify current
  limits) vs regular books, compared side by side; TDS-already-deducted credits (clients
  deduct 10% under 194J — the working capital reality; the engine nets it, the classic
  surprise); interest under 234B/234C computed and framed calmly (Quarterly's
  "behind-but-fixable" tone); new-regime slabs applied per In-Hand's engine (shared package).
  Presumptive-vs-books is the safe-harbor-style choice UI from Quarterly, reskinned.
- **Compliance note:** "verify with your CA" appears in the natural places — the app
  positions as the thing you bring *to* your CA, never instead of one (overview §3).
- **Oracles:** 234B/234C published examples; 44ADA worked examples; hand-derived
  TDS-netting cases. Goldens: mid-year freelancing start, receipts crossing the 44ADA
  ceiling, TDS exceeding liability (refund case — render kindly), the cumulative-percentage
  boundary dates.
- **ASO:** Play title `Advance Tax: Freelancer India` · short: `Advance tax dates & amounts,
  44ADA presumptive math, TDS credits. No ads.` Keywords: "advance tax calculator", "44ADA",
  "freelancer tax India". Channels: r/personalfinanceindia, freelancer/indie communities,
  CA-influencer YouTube (align, don't compete). Review: first payment marked paid.
  Pro: books-vs-presumptive multi-year view, export; ₹299.

## 3. Prepay — US sibling: [Payoff](../20-calculators/27-payoff.md)

**One sentence:** Home-loan prepayment as Indian banks actually offer it — reduce EMI or
reduce tenure, floating rates, and the honest prepay-vs-invest comparison.

- **Engine (`engine-prepay`) deltas:** floating-rate loans (repo-linked) with rate-change
  what-ifs; **the reduce-EMI vs reduce-tenure choice** — the uniquely Indian UX moment (banks
  literally ask; the app shows both futures side by side, which is the whole product); no
  prepayment penalty on floating-rate loans to individuals (RBI rule — stated as the
  confidence-builder); part-payment scheduling (annual bonus month pattern); old-regime tax
  angle (24(b) interest deduction, 80C principal) as an honesty note where applicable, muted
  under new regime; prepay-vs-invest with visible assumptions (Payoff's discipline).
- **Goldens:** EMI recomputation both ways to the rupee, rate-reset mid-schedule, bonus-month
  recurring prepays, tenure floors (bank minimums).
- **ASO:** Play title `Prepay: Home Loan EMI` · short: `Reduce EMI or reduce tenure? See both
  futures. Prepay vs invest, honestly.` Keywords: "home loan prepayment calculator", "reduce
  emi or tenure", "emi calculator". Channels: r/personalfinanceindia (prepay-vs-invest is
  their perennial thread), housing-society WhatsApp-forwardable explainer graphics (design the
  shareable screenshot for forwarding — India's distribution reality). Review: after saving a
  prepayment plan. Pro: multiple loans, rate-scenario packs; ₹249.

## 4. FD Ladder — US sibling: [Ladder](../20-calculators/23-ladder.md)

**One sentence:** Fixed-deposit ladders with real after-TDS yields, senior-citizen rates, and
premature-withdrawal math — the spreadsheet every Indian household keeps, done properly.

- **Engine (`engine-fdladder`) deltas:** FD compounding conventions (quarterly compounding
  typical; payout vs cumulative), TDS on interest above the threshold (with 15G/15H
  declaration note — informational only), senior-citizen rate differentials (the app's
  strongest persona: managing parents' FD ladders — cross-promo Health Binder's caregiver
  audience), premature-withdrawal penalty modeling (rate-minus-penalty on the applicable
  slab), ladder liquidity view (Ladder's rolling-availability visualization). Rates entered
  manually (bank rates vary; no scraping) — Ladder's manual-rate degradation is the primary
  path here, which simplifies the build.
- **Goldens:** quarterly-compounding accuracy to the rupee, TDS threshold straddles,
  senior-citizen ladders, premature-break scenarios.
- **ASO:** Play title `FD Ladder: Fixed Deposits` · short: `FD ladders with after-TDS yields,
  senior citizen rates & breakage math.` Keywords: "fd calculator", "fd laddering", "fixed
  deposit interest calculator". Channels: r/IndiaInvestments, parent-finance content ("set up
  your parents' FDs properly"). Review: first ladder rung marked booked. Pro: >2 ladders,
  family view; ₹199.

## 5. Repo notes

`calculators-in` mirrors the US repo. `tax-data` structure: `fy2026_27/regimes.ts` (both slab
sets + surcharge + cess), `fy2026_27/deductions.ts` (80C/80D/24b/HRA rules), `fy2026_27/
advance-tax.ts` (dates, 234B/234C rates, 44ADA parameters), `professional-tax.ts` (state
table), `epf.ts`. **FY/AY naming discipline in all copy** (FY 2026-27 = AY 2027-28 — mislabel
this and Indian users bounce instantly). Annual runbook keyed to the Union Budget (February)
with an explicit "slabs may change again" posture: the data package is built for churn.

## 6. Wave 2 (brief)

- **ESOP/RSU IN** — perquisite taxation at exercise/vest, capital gains at sale with the
  holding-period split, startup deferral rules for eligible companies; the Indian startup-
  employee audience is real and confused. Port of RSU Planner with a rewritten tax core.
- **Snowball IN** — near-verbatim port; personal-loan and credit-card debt framing; channels
  differ (debt discussion is quieter culturally — tone audit re-run with that in mind).
- **Rent or Buy IN** — deltas: stamp duty by state, no meaningful renter protections
  assumption differences, home-loan tax angles by regime; deferred until Prepay proves the
  housing audience.
