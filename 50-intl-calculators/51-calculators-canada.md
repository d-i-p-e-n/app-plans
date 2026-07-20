# Calculators — Canada (`calculators-ca`) — Plan

Read [00-intl-overview.md](00-intl-overview.md) first; it carries the structural, compliance,
and pricing decisions. This document specs the Canadian lineup: what each app is, how it
differs from its US sibling, and its country-specific engine, data, and ASO inputs. Where a
section is silent, the corresponding US plan applies verbatim.

**Lineup (build order): CPP Timing → Paycheque → Renewal → Room**, then wave-2 ports (§6).
All parameter values below are indicative — verify against CRA/Service Canada at build time.

---

## 1. CPP Timing (flagship) — US sibling: [Claiming Age](../20-calculators/24-claiming-age.md)

**One sentence:** Take CPP at 60, 65, or 70 — and defer OAS or not — shown with real Service
Canada formulas, break-evens, and the GIS/clawback interactions, with no advisor funnel.

- **Why flagship:** "when should I take CPP" is r/PersonalFinanceCanada's most perennial
  question and the answer-space online is entirely advisor lead-gen. The decision is richer
  than the US one (two programs, CPP × OAS, plus a clawback), which suits the show-the-formula
  approach perfectly.
- **Engine (`engine-cpp-oas`) deltas from Claiming Age:**
  - CPP actuarial adjustment: −0.6%/month before 65 (−36% at 60), +0.7%/month after
    (+42% at 70). Month-granular, like the US engine.
  - Statement mode = user's CPP estimate from My Service Canada Account (the accurate path);
    earnings mode = simplified average-earnings estimate with the general dropout (17% lowest
    years) and child-rearing dropout modeled coarsely, clearly labeled rougher. CPP
    enhancement (post-2019 tiers) as a data-driven adjustment.
  - OAS: eligibility by residence years (10/40 rules), deferral +0.6%/month to 70 (+36%);
    **OAS recovery tax (clawback)** above the income threshold — the Canadian IRMAA, and the
    reason high-income users defer.
  - GIS: income-tested top-up modeled for the low-income path — where taking CPP early can
    *reduce* total benefits via GIS clawback at 50 cents/dollar; this interaction is the
    single most valuable thing to show honestly, and almost nothing free shows it.
  - Break-evens: any two claiming strategies (CPP age × OAS age), nominal + real toggle.
  - Couple view: survivor-benefit realities (CPP survivor combining caps) in Phase 2 — complex
    and worth doing only with full oracle coverage, exactly like the US survivor deferral.
- **Oracles:** Service Canada published adjustment factors and examples; CPP enhancement
  legislation figures; hand-derived GIS interaction cases in `docs/oracles/`. Goldens:
  month-granular ages, GIS crossovers, clawback threshold ±$1, deferral-while-working.
- **Compliance:** overview §3 Canada wording; no Service Canada visual affiliation.
- **ASO & adoption** (playbook rules apply; verify limits):
  - iOS name: `CPP Timing` · subtitle: `Take it at 60, 65, or 70?`
  - Keyword field: `cpp,oas,retirement,pension,benefits,break even,calculator,gis,clawback,defer`
  - Play title: `CPP Timing: 60, 65 or 70?` · short: `CPP & OAS timing with real formulas, break-evens & clawback math. No ads.`
  - Long-description opener: "The most common Canadian retirement question, answered with the
    actual formulas: what claiming CPP at each month from 60 to 70 does to your cheque, how OAS
    deferral and the clawback interact, and where the break-evens sit — private, offline, no
    advisor funnel."
  - Channels: r/PersonalFinanceCanada (the channel), r/CanadianInvestor, retirement-focused
    Canadian podcasts/newsletters; screenshot story mirrors Claiming Age (drag-the-age curve →
    break-even → clawback view → "never leaves your phone").
  - Review moment: second session using the break-even view. Pro: couple/survivor module,
    >3 scenarios, PDF export; C$9.99.

## 2. Paycheque — US sibling: [Paycheck What-If](../20-calculators/22-paycheck-whatif.md)

**One sentence:** Model a raise, an offer, or an RRSP change and see the real per-paycheque
difference — federal + provincial, CPP and EI done right.

- **Engine (`engine-paycheque`) deltas:**
  - Federal + provincial brackets and credits (basic personal amounts, including the federal
    BPA phase-out at high income); launch provinces: ON, BC, AB (QC is Phase 2 — QPP/QPIP and
    Revenu Québec's separate system are a real second engine; flag honestly in-app).
  - CPP with the enhancement structure (base + CPP2 second ceiling) and mid-year YAMPE/YMPE
    crossovers; EI premiums with annual maximums; employer-side shown for the self-employed
    curiosity view but the product is employee take-home.
  - RRSP contribution effect on withholding (the "what does raising my RRSP % do to my
    paycheque" question — the Canadian analog of the 401k job); bonus method vs periodic
    method for lump payments.
  - **The oracle advantage:** CRA publishes the exact payroll deduction formulas (T4127) —
    encode them and the app matches CRA's own PDOC calculator, which becomes the validation
    target (document the cross-check, don't scrape it).
- **Goldens:** provincial surtaxes (ON), YMPE/YAMPE mid-year straddles, EI max hit, bonus
  method vs periodic, tune-to-my-stub flow tolerance.
- **ASO:** iOS `Paycheque What-If` · subtitle `Real take-home, no lead-gen` · keywords:
  `salary,take home,net pay,rrsp,tax,calculator,raise,offer,bonus,cpp,ei` · Play short:
  `Raises, offers, RRSP changes — real Canadian take-home math. Offline & private.`
  Channels: r/PersonalFinanceCanada offer-season threads; the PDOC-matching claim is the
  credibility line. Review: compare view with second scenario. Pro: provinces beyond launch
  trio, >3 scenarios; C$7.99.

## 3. Renewal — US sibling: [Payoff](../20-calculators/27-payoff.md) (heavily diverged)

**One sentence:** Canadian mortgage math as it actually works — semi-annual compounding, term
renewals, prepayment privileges, and an honest IRD penalty estimate.

- **Why diverged:** Canadian mortgages are structurally different from US ones and every
  difference is a modeling gap in generic tools: rates compound **semi-annually** (a quoted
  5.4% is not 5.4%/12 monthly — the conversion is the classic gotcha), loans run on short
  **terms** (typically 5 years) against long amortizations (25), and the renewal moment — not
  refinancing — is the national anxiety event.
- **Engine (`engine-renewal`):**
  - Correct periodic-rate conversion from semi-annual compounding; accelerated weekly/biweekly
    (which in Canada genuinely shortens amortization — the honest counterpart to the US
    biweekly myth-buster, and the contrast is a fun explainer).
  - **Renewal shock:** "your 1.89% term ends in 14 months — at 5.4%, payment goes from $2,310
    to $3,095; here's the amortization left." Scenario slider over renewal rates. This screen
    is the flagship feature and the shareable screenshot.
  - Prepayment privileges: annual lump (10–20% typical) + payment-increase allowances modeled
    per the user's entered terms; privilege-vs-penalty boundary warnings.
  - **IRD penalty estimator:** interest-rate-differential using the posted-rate method with
    loud honesty ("banks compute this differently; this is an estimate — ask for your exact
    quote") + the 3-month-interest floor comparison; break-fee vs blend-and-extend vs ride-it-
    out comparison at matched horizons (Payoff's matched-horizon discipline).
  - Invest-instead comparison carried over from Payoff, at Canadian rates context.
- **Oracles:** hand-built semi-annual-compounding schedules to the cent; published bank
  prepayment-privilege examples; FCAC explainer worked examples. Goldens: conversion accuracy,
  accelerated-payment amortization shortening, IRD floor crossovers, renewal mid-amortization.
- **ASO:** iOS `Renewal: Mortgage Math` · subtitle `Term shock, IRD & prepayment` · keywords:
  `mortgage,calculator,renewal,penalty,ird,prepayment,amortization,rate,home,payment` · Play
  short: `Renewal shock, IRD penalties & prepayment math — Canadian mortgages done right.`
  Channels: r/PersonalFinanceCanada + r/CanadianRealEstate renewal-wave threads (rate-reset
  cohorts make this evergreen), mortgage-broker-skeptic content. Review: after saving a
  renewal scenario. Pro: multiple properties, blend-and-extend module; C$7.99.

## 4. Room — US sibling: [Headroom](../20-calculators/26-headroom.md)

**One sentence:** RRSP or TFSA, and how much — marginal rates now vs later, contribution room,
and the OAS-clawback cliff, shown not sold.

- **Engine (`engine-room`) deltas:** RRSP room math (18% earned income to the annual max,
  carry-forward), TFSA cumulative room by birth year (data table), the core comparison
  (marginal rate at contribution vs expected rate at withdrawal — user assumptions, visible,
  Headroom discipline), OAS clawback as the cliff analog (contributions/withdrawal planning
  around the threshold), RRSP-meltdown-era marginal-rate curve (Headroom's
  next-dollar chart pointed at withdrawals). Spousal RRSP basics Phase 2.
- **ASO:** iOS `Room: RRSP & TFSA` · subtitle `Where the next dollar goes… shown` — careful:
  that phrasing edges toward Next Dollar's rejected framing; use `Marginal math, not advice` ·
  keywords: `rrsp,tfsa,contribution,room,tax,retirement,savings,calculator,clawback,marginal` ·
  Play short: `RRSP vs TFSA with your real marginal rates and the OAS clawback cliff. No ads.`
  Channels: r/PersonalFinanceCanada (the RRSP-vs-TFSA thread is their perennial #1 — this app
  is built to be linked in it). Review: second scenario compare. Pro: couple view, meltdown
  planner; C$9.99. **Copy audit is strictest here** — the app shows comparisons and cliffs;
  it never answers "which should I use" in its own voice.

## 5. Repo notes

`calculators-ca` mirrors the US repo (overview §2). `tax-data` structure:
`y2026/federal.ts`, `y2026/provinces/{on,bc,ab}.ts`, `y2026/cpp-ei.ts`, `y2026/oas-gis.ts`,
`tfsa-room.ts` (historical table). Annual runbook: CRA indexation news, T4127 formula updates,
Service Canada rate pages, provincial budgets — due each January (and re-check after federal
budgets). QC phase 2 adds `qc.ts` + QPP/QPIP and its own runbook entries.

## 6. Wave 2 (brief — port per US plan + this doc's conventions)

- **Snowball CA** — near-verbatim port (debt math is universal); Canadian channels
  (r/PersonalFinanceCanada, r/DebtFreeCanada-class communities).
- **Rent or Buy CA** — deltas: land transfer taxes (provincial + Toronto municipal), CMHC
  insurance premiums under 20% down, **no mortgage-interest deduction** (simplifies the tax
  honesty section — note it as a US-vs-CA explainer), principal-residence exemption on sale.
- **Instalments** (Quarterly CA) — CRA instalment rules (owing >$3k threshold, no-calculation
  vs prior-year vs current-year options — the three-method choice maps neatly onto Quarterly's
  safe-harbor UI), Mar/Jun/Sep/Dec 15 dates.
- **RSU Planner CA** — RSU taxed as employment income at vest; the security-options deduction
  does not apply to RSUs (a top misunderstanding — the explainer is the feature); provincial
  top rates; no US-style flat supplemental withholding.
