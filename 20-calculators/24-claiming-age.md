# Claiming Age — Plan

**One sentence:** Understand what claiming Social Security at 62 vs 67 vs 70 actually does to your
monthly check and lifetime totals — educational math, no advisor funnel.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. **This app has the strictest
compliance-tone requirements in the portfolio — read §6 before writing any copy.**

## 1. Product

- **Audience:** people 55–70 and their adult children helping them decide. Enormous, growing,
  and served today by either ssa.gov (accurate, impenetrable) or advisor lead-gen calculators
  (motivated to create anxiety → AUM).
- **Core jobs:** (1) "What's my monthly benefit at each claiming month from 62 to 70?"
  (2) "Where's the break-even between claiming early vs waiting?" (3) "How do spousal benefits
  work for us?" (4) "What happens if I keep working / claim while working?"
- **Differentiator:** shows the actual SSA formulas step by step. The transparency *is* the
  product; every competing tool hides the math to look proprietary.

Non-goals: connecting to my Social Security / any SSA account (user types numbers from their SSA
statement), survivor-benefit optimization beyond the standard cases (Phase 6 — genuinely
complex), disability (SSDI), WEP/GPO (Phase 6; note: mostly repealed by the Social Security
Fairness Act — verify current law at build time), Medicare (separate domain; one static explainer
paragraph max), longevity prediction (user picks planning ages; we never estimate lifespan).

## 2. Engine (`packages/engine-ssa`)

Two entry modes:
- **Statement mode (primary, most accurate):** user copies their PIA or FRA benefit estimate off
  their SSA statement. Engine applies claiming-age adjustments only — small formula surface,
  high accuracy.
- **Earnings mode (secondary):** user enters current earnings + years worked for an AIME→PIA
  estimate (simplified earnings-history projection, clearly labeled as rougher).

Core math (all parameters from `packages/tax-data` `ssa.ts`, cited to ssa.gov/oact):
1. **FRA by birth year** table.
2. **Early reduction:** 5/9 of 1% per month for first 36 months before FRA, 5/12 of 1% beyond;
   spousal reductions use their own (25/36 of 1%, then 5/12) schedule.
3. **Delayed retirement credits:** 2/3 of 1% per month FRA→70.
4. **PIA formula** (earnings mode): bend points for the eligibility year, 90/32/15 factors.
5. **Spousal:** up to 50% of worker's PIA, own-benefit interaction (deemed filing), reductions.
6. **Earnings test:** claiming before FRA while working — annual exempt amounts, $1 withheld per
   $2/$3, and the "it's not lost" recomputation at FRA (this is the most misunderstood rule in
   the system; modeling it honestly is a differentiator).
7. **Break-even:** cumulative nominal totals for any two claiming ages, crossing age; optional
   real-dollar view with user-chosen COLA assumption (default 0% real — avoid forecasting).

Outputs always as monthly benefit in today's dollars + cumulative curves; every number expands
to its derivation ("62 y 0 m = 30% reduction because 60 months early: 36×5/9% + 24×5/12%").

Oracles: SSA's published worked examples (ssa.gov/oact benefit-calculation examples, the "Quick
Calculator" cross-checks recorded manually in `docs/oracles/`); bend-point examples per year.
Goldens: ≥60 cases — every birth-year FRA, month-granular claiming ages, spousal combinations
(both claiming, one delayed), earnings-test years, February-29 birthdays, the born-on-the-1st/
2nd month-counting rules (SSA counts these oddly — encode and test).

## 3. Screens

- `/(onboarding)`: SSA-specific disclaimer (§6) → birth year/month (+spouse optional) → statement
  vs earnings mode → PIA entry with a "where to find this on your statement" illustration.
- `/` **The Curve:** monthly benefit vs claiming age (62→70) as the hero chart; drag a handle
  along it, benefit updates live; FRA marked; spouse's curve overlays when enabled.
- `/breakeven`: pick two ages → cumulative crossover chart + plain sentence: "Claiming at 70
  passes claiming at 62 in total dollars at age 80 y 4 m under these assumptions."
- `/couple`: joint view — both curves, spousal top-up visualization, simple strategy comparison
  table (both at 62 / both FRA / lower earner early + higher earner 70) with lifetime totals at
  the user's chosen planning ages. Label: "comparison, not recommendation."
- `/working`: earnings-test modeler with the recomputation-at-FRA explanation inline.
- `/learn`: the derivations as a short readable reference ("How the math works"), each section
  linking the ssa.gov source.
- `/settings`: data-year banner, planning ages, COLA assumption, disclaimers.

## 4. Phases & acceptance criteria

1. **Engine core:** FRA/reduction/credit math month-granular + oracle tests; statement mode
   end-to-end.
2. **Engine extended:** spousal + earnings test + break-even; earnings-mode PIA; full goldens.
3. **App:** curve (gesture-driven), break-even, couple view, working view, learn pages.
4. **Copy & compliance review:** every screen's language audited against §6; `docs/copy-audit.md`
   sign-off recorded.
5. **Release:** EAS, listing, "no data collected." Extra: large-type default ON for this app's
   audience (respect but pre-boost OS font scale in the type scale choices).

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle. Naming note: "Social
Security" may appear descriptively in subtitle/keywords but nothing may imply government
affiliation (§6 of this plan).

- **iOS name:** Claiming Age
- **iOS subtitle:** Social Security benefit math
- **iOS keyword field:** retirement,benefits,break even,spousal,fra,pia,claim,62,67,70,calculator,pension
- **Play title:** Claiming Age: Benefit Math
- **Play short description:** Social Security at 62 vs 67 vs 70 — real formulas, break-evens, no ads.
- **Keyword targets:** primary "social security calculator", "when to take social security"; long-tail "social security break even 62 vs 70", "spousal benefit calculator".
- **Play long description — first two lines:** "What does claiming at 62 versus 67 versus 70 actually do to your monthly check? Claiming Age shows the real SSA formulas step by step — reductions, delayed credits, spousal benefits, break-even ages — with no advisor funnel and your numbers never leaving your phone."
- **Screenshot story:** the drag-the-age curve → break-even crossover → couple comparison → "your numbers never leave this phone."
- **Launch channels:** r/SocialSecurity, r/retirement, retirement-planning Facebook groups (the dominant channel for this demographic), r/AgingParents (adult children research for parents), retirement newsletters/podcasts.
- **Review prompt moment:** the second session in which the break-even view is used. Excluded: first session.
- **Pro candidates & anchor:** survivor scenarios (Phase 6), >3 scenarios, comparison PDF export; one-time $7.99.
- **Web/SEO queries:** "social security break even calculator 62 vs 70", "spousal social security benefit how much", "claim social security while still working penalty", "how social security is calculated bend points". Publish the /learn derivations as web pages — trust + link magnet.

## 6. Compliance & tone (strict)

- Never output "you should claim at X." Outputs are comparisons under stated assumptions,
  always with assumptions visible on the same screen.
- Mandatory disclaimer (first launch + settings + bottom of every results screen, short form):
  "Educational estimates based on published SSA formulas. Not affiliated with or endorsed by the
  Social Security Administration. Your actual benefit is determined by SSA. Verify at ssa.gov."
- The words "Social Security" may appear descriptively but branding must not imply government
  affiliation (App Store rejects for this — no eagle/flag/SSA-blue official styling).
- No longevity language beyond user-chosen "planning age." Never "life expectancy tables say…".

## 7. Risks

- Law changes (e.g., Fairness Act aftermath, future reform) — annual-update runbook covers SSA
  parameters; a visible "figures for {year}" banner is mandatory.
- Month-counting edge rules (birthdays on the 1st/2nd, attainment-of-age conventions) are where
  amateur calculators are wrong — they're encoded in oracle tests or the app isn't shipped.
- The audience skews less technical: usability test the PIA-entry step with real SSA statement
  screenshots (fixtures in `docs/`), and keep earnings mode clearly second-class.
