# Headroom — Plan

**One sentence:** See exactly how much Roth conversion (or capital-gain harvesting) fits in this
tax year before you hit the next bracket, an IRMAA cliff, or the Social Security tax torpedo.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Build **after Claiming Age** — it
reuses SSA taxability math and adds Medicare/IRMAA tables to `tax-data`.

## 1. Product

- **Audience:** retirees and early retirees in the "gap years" (retired, pre-RMD) doing Roth
  conversion ladders; FIRE crowd; anyone tax-gain harvesting in the 0% LTCG bracket. Smaller
  than Paycheck's audience but the single most engaged personal-finance niche that exists
  (this is Bogleheads' perennial #1 topic), with zero good mobile tools — only advisor
  spreadsheets and AUM lead-gen.
- **Gap:** the question "how much can I convert this year?" has a deterministic answer that
  depends on five interacting thresholds most tools ignore (brackets, LTCG stacking, IRMAA
  cliffs, SS taxability phase-in, NIIT). Getting the interactions right *and showing them* is
  the whole product.
- **The hero output:** an effective-marginal-rate curve for "the next dollar of conversion" —
  "your next $10,000 converts at 12%; the $10,000 after that at 22.2% because it drags Social
  Security into taxability; $6,400 later you cross an IRMAA cliff that costs $1,700 flat in
  2028 premiums."

Non-goals: multi-year optimization/auto-planning ("convert $X for 7 years" — Phase 7 at most;
single-year clarity first), account linking (never), state tax detail beyond launch states'
flat treatment of conversions (data-driven later), inherited-IRA rules, advice of any kind
(comparisons under stated assumptions, family standard).

## 2. Engine (`packages/engine-headroom`)

Inputs: filing status; ages (65+ standard-deduction bump; Medicare relevance ≥63 because of
the 2-year IRMAA lookback); income items for the year — wages, interest, ordinary + qualified
dividends, pension/annuity, tIRA withdrawals already taken, Social Security benefits (annual),
realized STCG/LTCG; planned conversion amount (the slider variable); planned additional LTCG
harvest (second slider, Phase 2 makes them simultaneous).

Core computation (pure, and this is where correctness is the moat):
1. **Ordinary/preferential stacking:** taxable ordinary income fills brackets; qualified
   divs/LTCG stack on top with their own 0/15/20% thresholds. The classic error is treating
   them independently — our stacked-bars visualization *is* this computation made visible.
2. **SS taxability phase-in** (Pub 915 worksheet): provisional income → 0/50/85% taxable, which
   makes marginal rates spike to 1.85× bracket rates in the torpedo zone. Reuses/extends
   `engine-ssa` worksheet code.
3. **IRMAA:** MAGI (AGI + tax-exempt interest) vs the tier table for the *premium year*
   (labeled "affects your {Y+2} Medicare premiums"); cliff cost shown in dollars/year at
   current published premiums (`tax-data` medicare file). Cliffs are cliffs — $1 over costs
   the full tier; the UI treats them as hard walls.
4. **NIIT:** 3.8% over $200k/$250k MAGI on net investment income (conversions aren't NII but
   raise MAGI over the threshold — the exact interaction people miss; oracle-test it).
5. **Headroom table:** dollars of additional conversion until each next threshold: bracket
   tops, LTCG 0→15 and 15→20, each IRMAA tier, NIIT, SS 50→85 transitions, standard-deduction
   exhaustion. Sorted by nearest.
6. **Marginal-rate curve:** effective federal rate on each incremental $100 of conversion from
   $0 to a user max — the hero chart's data. Deterministic, golden-tested.

Oracles: IRS worksheet examples (Pub 915, Qualified Dividends & CG worksheet), published IRMAA
tier tables, hand-derived torpedo-zone cases in `docs/oracles/` (spreadsheet + derivation).
Goldens ≥70: torpedo entry/exit, cliff-edge ±$1 cases, 63-vs-65 age gates, MFJ↔single, zero-SS
early retirees (pure bracket/LTCG cases), NIIT crossover via conversion.

## 3. Screens

- `/(onboarding)`: family disclaimer + one extra sentence on IRMAA lookback ("today's decisions
  set 2028's premiums") → income entry (grouped, ~8 fields, all optional-except-one) → the
  chart.
- `/` **Headroom:** the stacked-income bar (ordinary / LTCG / SS-taxable portions, thresholds
  as horizontal lines) with the conversion slider under it; live headroom table beside/below.
  Drag the slider, watch which wall you hit first. This screen is the app.
- `/curve`: the marginal-rate-per-next-dollar chart with annotated regime zones (torpedo, cliff
  positions); tap a zone for the plain-language why.
- `/cliffs`: IRMAA detail — tiers, your projected MAGI, dollar cost per tier per year, the
  lookback explanation.
- `/scenarios`: family-standard compare ("convert to top of 12%" vs "to IRMAA tier 1 − $1k
  buffer").
- `/learn`: derivations reference (like Claiming Age's) — stacking, torpedo, IRMAA, each with
  its IRS/SSA/CMS source.
- `/settings`: data-year banner, disclaimers, export seam.

## 4. Phases & acceptance criteria

1. **Engine core:** stacking + brackets + LTCG thresholds; oracle tests for the QDCGT
   worksheet; headroom table.
2. **Engine interactions:** SS taxability + IRMAA + NIIT; the full marginal-rate curve; cliff
   ±$1 goldens all green.
3. **App:** stacked-bar + slider at 60fps (the interaction quality is the wow), curve view,
   cliffs view, scenarios.
4. **Copy & compliance:** same audit gate as Claiming Age (no "you should convert X" anywhere;
   assumptions always visible; `docs/copy-audit.md` signed off).
5. **Release:** EAS, listing (§6), "no data collected."

## 5. Risks

- This engine has the most interacting rules in the portfolio — the oracle set is the product;
  do not ship any threshold whose ±$1 behavior isn't golden-tested.
- Annual data churn (brackets, IRMAA tiers, premiums, SS parameters) — all in `tax-data` with
  the January runbook; the "figures for {year}" banner is mandatory.
- Audience skepticism is high (Bogleheads will hand-check everything) — that's the moat if
  we're right and fatal if we're wrong; publish the `docs/oracles/` derivations on the web
  landing page as a trust artifact.

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Headroom: Roth Conversions
- **iOS subtitle:** Brackets, IRMAA & the torpedo
- **iOS keyword field:** roth,conversion,irmaa,tax,bracket,retirement,medicare,rmd,capital gains,harvest,magi,fire
- **Play title:** Headroom: Roth Conversions
- **Play short description:** How much Roth conversion fits this year — before brackets & IRMAA cliffs bite.
- **Keyword targets:** primary "roth conversion calculator", "irmaa calculator"; long-tail "how much can I convert to roth without going up a bracket".
- **Play long description — first two lines:** "The gap-years question, answered precisely: how much Roth conversion fits in this tax year before the next bracket, an IRMAA cliff, or the Social Security tax torpedo? Every threshold, every interaction, shown — not hidden behind an advisor funnel."
- **Screenshot story:** stacked-bar with slider mid-drag → marginal-rate curve with torpedo zone annotated → IRMAA cliff detail in real dollars → "your numbers never leave this phone."
- **Launch channels:** Bogleheads forum (the single highest-fit channel in the entire portfolio — participate genuinely first), r/Fire, r/financialindependence, early-retirement.org, retirement-focused newsletters/podcasts (pitch: "the tax torpedo, finally visualized").
- **Review prompt moment:** after saving a second scenario (planning-mode engagement). Excluded: first session.
- **Pro candidates & anchor:** simultaneous conversion+harvest optimization, multi-year view, >3 scenarios; one-time $9.99 (premium tier justified — family overview).
- **Web/SEO queries:** "roth conversion how much per year", "irmaa cliff 2026 amounts", "social security tax torpedo explained", "tax gain harvesting 0 percent bracket calculator". Publish the oracle derivations page as the trust/link magnet.
