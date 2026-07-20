# Payoff — Plan

**One sentence:** What extra payments, a recast, or a refinance actually do to your mortgage —
payoff date, interest saved, PMI drop-off, and the honest "or invest it instead" comparison,
with zero lead-gen.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** the ~85 million US mortgaged households at two recurring moments: "should I
  throw extra money at this?" (perennial, especially low-rate holders torn between paying down
  3% debt and investing) and "rates moved — is a refi worth it?" (episodic, huge search
  volume whenever rates drop).
- **Gap:** every mortgage calculator on the internet exists to capture a refinance lead. The
  math is deterministic and simple; the honest version — matched horizons, visible assumptions,
  the recast option lenders don't advertise, the invest-instead comparison lead-gen sites
  suppress — doesn't exist as a clean private mobile tool.
- **Core jobs:** (1) "$300/mo extra: when am I done, what do I save?" (2) "When does PMI
  actually drop, and can I accelerate it?" (3) "Refi at X% with $Y closing costs — break-even
  month, and is it worth it if I move in 5 years?" (4) "Recast vs refi vs extra payments?"
  (5) "Extra payments vs investing the same money — shown fairly."

Non-goals: rate quotes or any live rate data (user enters rates — keeps us pure and offline),
affordability/pre-qualification ("how much house can I afford" is a lead-gen trope; Rent or Buy
covers the adjacent honest question), escrow/tax/insurance modeling beyond a pass-through line
(we model the loan, not the servicer's escrow), ARM modeling (Phase 6 — fixed-rate first), HELOC
(Phase 7).

## 2. Engine (`packages/engine-payoff`)

Inputs: current balance, rate, remaining term (or original terms + start date — both entry
paths, reconciled), payment (derived, or entered and validated), PMI monthly + original
purchase price/LTV basis, extra-payment plans (monthly recurring, annual lump, one-time on a
date), refi candidate (rate, term, closing costs, roll-in vs cash), recast candidate (lump sum,
typical $250-class fee, same rate re-amortized), invest-alternative assumption (expected annual
return, entered by user with a visible "your assumption" label).

Outputs (all cents-exact, `finmath` day/rounding conventions):
1. **Baseline vs strategy amortization:** payoff date, total interest, month-by-month schedule.
2. **PMI drop:** the 78% LTV automatic-termination date on the original amortization schedule
   (the legal default under HPA), the 80% request point, and how extra payments pull both in —
   with the honest caveat that appreciation-based removal requires an appraisal and lender
   agreement (informational line, no promises).
3. **Refi break-even:** months until saved interest exceeds closing costs, **matched-horizon
   comparison** (the industry trick is comparing a fresh 30-year against your remaining 22 and
   calling the payment drop "savings" — we compare equal horizons and show why in one
   sentence), and "if you sell/move in N years" slider.
4. **Recast vs refi vs extra:** one table, same horizon, total cost each way.
5. **Invest-instead:** the same extra dollars compounded at the user's assumption, after a
   simple capital-gains haircut toggle, vs guaranteed interest saved at the mortgage rate —
   presented as "guaranteed X% vs assumed Y%, here's the crossover assumption," never a
   recommendation. The visible-assumption discipline is the whole credibility play.
6. **Biweekly honesty module:** shows that "biweekly" = 13 payments/year, models it as such,
   and notes servicer biweekly-program fees make DIY extra payments equivalent — a one-screen
   myth-buster that earns reviews.

Oracles: hand-built amortization spreadsheets in `docs/oracles/` (multiple loans, extra-payment
patterns) cross-checked to the cent; HPA 78%-rule examples from CFPB explanations. Goldens ≥60:
odd payment amounts, first-payment-date offsets, one-time extra landing mid-schedule, extra
payment that exactly closes the loan, PMI already droppable at entry, refi with negative
break-even (never worth it — must say so plainly).

## 3. Screens

- `/(onboarding)`: family disclaimer → loan entry ("grab your statement — balance, rate,
  payment" or original-terms path) → baseline card. Under 90 seconds to a payoff date.
- `/` **My Loan:** payoff-date hero, total-interest-remaining line, PMI-drop marker if
  applicable, and the strategy cards (Extra / Recast / Refi / Invest-instead) each with its
  headline delta.
- `/strategy/extra`: sliders for monthly/annual/one-time; live twin-bar timeline (baseline vs
  strategy) with the delta labels; the biweekly myth-buster link.
- `/strategy/refi`: candidate entry; break-even hero; matched-horizon explanation expandable;
  move-in-N-years slider.
- `/strategy/recast`: lump + fee; comparison against refi and extra with the same lump.
- `/strategy/invest`: the two-line chart (interest saved vs assumed growth) with the crossover
  assumption stated in words.
- `/schedule`: full amortization table (virtualized list), export seam.
- `/compare`: family-standard scenario compare.
- `/settings`: disclaimers, assumptions registry (every default listed with its rationale),
  export seam.

## 4. Phases & acceptance criteria

1. **Engine:** amortization + extra payments + PMI rules; oracle spreadsheets matched to the
   cent; goldens.
2. **Engine strategies:** refi matched-horizon + recast + invest-instead; the
   negative-break-even honesty path tested.
3. **App:** all screens; 90-second onboarding measured; twin-bar timeline at 60fps.
4. **Validation:** 15 scenarios cross-checked against two commercial calculators with
   discrepancies explained (their horizon tricks documented in `docs/oracles/` — this doubles
   as web content, §6).
5. **Release:** EAS, listing (§6), "no data collected."

## 5. Risks

- The invest-instead module walks the advice line — it presents both sides under user-visible
  assumptions and never recommends; copy audit gate (Claiming Age standard).
- Servicer-specific behaviors (payment application order, escrow shortage recalcs) cause
  penny-level mismatches with statements — state the tolerance honestly like Paycheck does.
- Refi-season traffic is spiky; the app must rank *before* the next rate drop — ship the SEO
  pages early (§6).

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Payoff: Mortgage What-Ifs
- **iOS subtitle:** Extra payments, refi, recast
- **iOS keyword field:** amortization,refinance,pmi,interest,home,loan,house,calculator,early,biweekly,break even
- **Play title:** Payoff: Mortgage What-Ifs
- **Play short description:** See what extra payments or a refi really do. No lead-gen, no ads, offline.
- **Keyword targets:** primary "mortgage payoff calculator", "refinance calculator"; long-tail "when does pmi fall off", "recast vs refinance".
- **Play long description — first two lines:** "Every mortgage calculator online wants to sell you a refinance. This one just does the math: extra payments, recast, refi break-even at matched horizons, PMI drop dates, and the honest 'or invest it instead' comparison — offline, private, no lead forms."
- **Screenshot story:** payoff-date hero with twin-bar timeline → PMI-drop marker pulled earlier → matched-horizon refi break-even → the biweekly myth-buster.
- **Launch channels:** r/personalfinance, r/Mortgages, r/FirstTimeHomeBuyer, Bogleheads (pay-down-vs-invest is a perennial thread genre — the visible-assumption crossover framing is built for it), rate-drop news cycles (listing and SEO pages must pre-exist the spike).
- **Review prompt moment:** after saving a second strategy comparison. Excluded: sessions where the refi verdict was "not worth it" (honest but sour moment).
- **Pro candidates & anchor:** multiple loans (rentals), ARM/HELOC modules (Phase 6–7), schedule export; one-time $6.99.
- **Web/SEO queries:** "should I pay extra on my mortgage or invest", "when does pmi fall off calculator", "refinance break even calculator no personal info", "mortgage recast vs refinance which is better". The matched-horizon trick exposé is the link-magnet article.
