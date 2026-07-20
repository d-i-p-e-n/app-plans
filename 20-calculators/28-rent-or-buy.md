# Rent or Buy — Plan

**One sentence:** The rent-vs-buy decision with every assumption visible, adjustable, and
stress-tested — no agent funnel, no thumb on the scale.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** renters weighing a first purchase — a huge, anxious, actively searching cohort —
  plus HCOL skeptics who suspect renting wins and want honest math to check.
- **Gap:** nearly every rent-vs-buy tool is realtor/lender lead-gen with buy-biased defaults
  (low maintenance %, high appreciation, ignored opportunity cost, phantom tax savings). The
  NYT calculator is the honest gold standard but web-only and paywalled. A private, mobile,
  assumption-forward version doesn't exist.
- **The differentiating honesty (three things competitors fake):**
  1. **Opportunity cost of the down payment** — modeled, visible, adjustable.
  2. **The standard-deduction reality** — most buyers get little or no mortgage-interest tax
     benefit post-2017; we check itemization against the standard deduction using `tax-data`
     instead of assuming full deductibility.
  3. **Sensitivity, not certainty** — the output leads with which assumptions actually drive
     the answer (appreciation and horizon dominate), not a false-precision verdict.

Non-goals: listings/affordability/pre-qual (lead-gen territory), specific-market forecasts (the
user picks appreciation; we never supply a "your city will appreciate X%" number), investment
property analysis (Phase 7 at most), advice ("comparison under stated assumptions" — family
standard).

## 2. Engine (`packages/engine-rentbuy`)

Inputs — **buy side:** price, down %, rate, term, closing costs (buy ~2–5% and sell ~6–8%
defaults, editable), property tax rate, homeowner's insurance, maintenance %/yr (default 1%,
the honest number), HOA, PMI when <20% down (reuse `engine-payoff` PMI logic), appreciation
assumption, marginal tax rate + filing status (for the itemization check via `tax-data`).
**Rent side:** current rent, renter's insurance, rent-growth assumption, security deposit.
**Shared:** horizon (years), investment-return assumption (for down-payment + monthly-difference
opportunity cost), general inflation for real-terms display, capital-gains exclusion on sale
(§121 250k/500k — modeled, another thing lead-gen tools ignore in both directions).

Outputs:
1. **The crossover:** "Under these assumptions, buying comes out ahead if you stay at least
   6.4 years." One number, one sentence, always with "under these assumptions."
2. **Horizon curve:** net cost of buying vs renting at every horizon 1–30 years (the two-line
   chart hero); either line can win and the app doesn't care.
3. **Cash-flow table:** year by year, both sides, every component expandable (family
   show-your-work standard).
4. **Sensitivity tornado:** vary each assumption ±1σ-style ranges (defined per assumption,
   documented); rank by impact on the crossover year. This chart is the anti-lead-gen
   statement rendered as data.
5. **Break-glass scenarios:** one-tap presets — "appreciation = 0%," "2008-style −20% then
   recovery," "rent control (rent growth 0%)" — stress tests, clearly labeled as illustrations
   not predictions.

Oracles: a fully hand-derived comparison spreadsheet in `docs/oracles/` (10-year case, every
line item), NYT methodology essay used as a conceptual checklist only (no code or content
copying; note the differences we choose and why in `docs/`). Goldens ≥50: 0%-down VA-style,
itemize-vs-standard flips, §121 exclusion binding vs not, crossover-never cases (renting wins
at every horizon — must render cleanly), crossover-immediately cases, PMI on/off.

## 3. Screens

- `/(onboarding)`: family disclaimer → five quick inputs (rent, price, down %, rate, horizon
  guess) with everything else defaulted-and-visible → the crossover. Under 60 seconds; depth is
  opt-in from there.
- `/` **Verdict:** crossover sentence + horizon curve; "these 3 assumptions drive your answer"
  chips linking into the tornado.
- `/assumptions`: every input with its default, its source/rationale line, and a reset-all;
  the itemization check shown as a plain sentence ("At your numbers you'd take the standard
  deduction — mortgage interest saves you $0/yr" or the actual figure).
- `/sensitivity`: the tornado + per-assumption sliders with live crossover updates.
- `/cashflow`: the year-by-year table.
- `/scenarios`: family-standard compare (e.g., "this condo" vs "cheaper suburb house").
- `/settings`: disclaimers, tax-year banner, export seam.

## 4. Phases & acceptance criteria

1. **Engine core:** both cash-flow stacks + crossover + itemization check; oracle spreadsheet
   matched; goldens including the never/immediate crossover edges.
2. **Sensitivity:** tornado ranges defined + documented; per-assumption impact math tested.
3. **App:** 60-second onboarding measured; verdict + assumptions + tornado + cashflow;
   crossover updates <100 ms on slider drag.
4. **Copy & compliance:** audit gate (Claiming Age standard) — no verdict without "under these
   assumptions," no market predictions anywhere, break-glass presets labeled as illustrations.
5. **Release:** EAS, listing (§5), "no data collected."

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Rent or Buy
- **iOS subtitle:** Honest math, your assumptions
- **iOS keyword field:** house,home,calculator,mortgage,first time,buyer,renting,compare,afford,crossover,cost
- **Play title:** Rent or Buy Calculator
- **Play short description:** Rent vs buy with every assumption visible. No agent funnel, no bias, offline.
- **Keyword targets:** primary "rent vs buy calculator", "should I buy a house"; long-tail "rent vs buy calculator without realtor", "is buying always better than renting".
- **Play long description — first two lines:** "Every rent-vs-buy calculator online is owned by someone who profits when you buy. This one isn't: the down payment's opportunity cost, the standard-deduction reality, selling costs, and a sensitivity chart showing which assumptions actually drive your answer — either side can win."
- **Screenshot story:** crossover sentence with horizon curve → the "$0 tax benefit" itemization honesty line → sensitivity tornado → "no agent funnel" framing shot.
- **Launch channels:** r/FirstTimeHomeBuyer, r/personalfinance, r/REBubble (skeptic audience that shares honest tools), Show HN (assumption-forward design story), personal-finance YouTube/newsletter reviewers who cite the NYT tool's paywall.
- **Review prompt moment:** after adjusting three or more assumptions and returning to the verdict (the engaged-skeptic moment).
- **Pro candidates & anchor:** >3 scenarios, sensitivity/cash-flow export, condo-vs-house preset packs; one-time $5.99.
- **Web/SEO queries:** "rent vs buy calculator free no signup", "nyt rent vs buy calculator alternative", "how long do I need to stay for buying to be worth it", "does the mortgage interest deduction matter standard deduction". The assumptions-with-rationale registry doubles as the SEO page.

## 6. Risks

- Housing is emotionally and politically charged — the app must be genuinely neutral in copy
  and defaults; the tornado chart is the neutrality proof, and the copy audit enforces it.
- Users will want "what will my city appreciate?" — the answer is a firm never; supplying
  forecasts would convert the honesty product into another prediction machine.
- Overlap with Payoff (mortgage math) is deliberate reuse (`engine-payoff` amortization/PMI as
  a dependency), not duplication — enforce via a shared package, not copied code.
