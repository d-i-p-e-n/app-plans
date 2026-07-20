# Sixty-Five — Plan

**One sentence:** Your Medicare enrollment windows, the lifelong late penalties in real
dollars, and the working-past-65 decision tree — dates and math, not insurance sales.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Claiming Age's natural sibling —
shared audience, cross-promoted; **read §6's marketing-compliance notes before writing any
copy: Medicare-adjacent marketing is a regulated minefield and our not-selling-anything
posture is the entire safe path.**

## 1. Product

- **Audience:** the ~4 million Americans turning 65 each year — and increasingly working
  past 65 with employer coverage, which is exactly where the expensive mistakes live. Also
  their adult children (the r/AgingParents channel again).
- **Gap:** the enrollment-window rules (IEP/SEP/GEP) and late-enrollment penalties are
  deterministic and published, but the entire information ecosystem is broker lead-gen —
  every "Medicare guide" site exists to sell Advantage plans. A tool that computes *your
  dates and your penalty math* and sells nothing is structurally unavailable from anyone
  with a commission.
- **Core jobs:** (1) "What are MY enrollment windows, given my birthday?" (2) "I'm still
  working at 66 with employer coverage — do I need Part B yet? What about my HSA?" (3) "If
  I delay wrongly, what does the penalty actually cost per month, forever?" (4) "Remind me
  before my windows close."

Non-goals — **the no-selling wall, absolute:** no plan comparisons, no Advantage-vs-Medigap
recommendations, no premium quoting, no broker referrals, no plan-finder features (CMS's
plan finder does that; we link the official tool by name). The moment this app compares
plans it becomes a regulated marketing entity; it never does. Also out: claims/coverage
questions, Medicaid, disability-pathway enrollment (Phase 2 at most, with care).

## 2. Engine (`packages/engine-sixtyfive`)

Inputs: birth month/year, current/planned work status past 65, employer coverage status and
employer size (the 20-employee rule that determines whether employer coverage is primary —
the load-bearing fact of the whole decision), HSA contribution status, spouse coverage
situation (basic), months already elapsed without creditable coverage (for penalty
computation).

Outputs:
1. **Personal window timeline:** IEP (the 7-month window around the 65th birthday month,
   with the enrollment-timing-vs-coverage-start rules), SEP (8-month window after employer
   coverage ends — with the "COBRA is not creditable for Part B" trap stated loudly, since
   it is the classic five-figure mistake), GEP fallback with its coverage-start
   consequences. Rendered as a dated timeline for *this* birthday.
2. **Penalty math in dollars:** Part B late penalty (10% of the standard premium per full
   12-month period late, **lifelong** — shown as "$X/month for life, $Y over 20 years"
   at the current published premium with the data-year banner), Part D penalty (1% of the
   national base premium per month late, lifelong) — the compounding-forever framing is
   what motivates timely action, and it's pure arithmetic.
3. **The working-past-65 decision tree:** employer-size rule → primary/secondary
   determination → "Part A now or not" with the **HSA trap** computed precisely: enrolling
   in any Medicare part ends HSA eligibility, and Part A enrollment is retroactive up to
   6 months — so HSA contributions must stop 6 months before enrollment or face excise
   consequences (the HSA/FSA Vault cross-promo writes itself). Rendered as dated guidance:
   "if you enroll in October, your last safe HSA contribution month is April."
4. **Reminder ladder** (the life-admin crossover feature): local notifications at
   window-open, mid-window, and window-close − 30/7 days for the user's computed dates —
   Expiry Vault's laddering pattern inside a calculator app.

Oracles: CMS/SSA published rules and premium figures; the penalty formulas' published
examples; hand-derived HSA-timing cases checked against IRS Pub 969's Medicare interaction
guidance. Goldens ≥50: birthday-on-the-1st IEP shift rule (the same month-counting oddity
Claiming Age handles — share the convention code), employer-size boundary, COBRA-gap
scenarios, penalty periods with partial years, HSA lookback across year boundaries.

## 3. Screens

- `/(onboarding)`: disclaimer (family standard + §6 wording) → birthday + work/coverage
  questions (5 fields) → the timeline. Under 3 minutes.
- `/` **My Timeline:** the dated windows with today marked; active-window state is the hero
  ("Your IEP is open — 4 months remain").
- `/penalties`: the lifelong-cost calculator with both penalties in dollars.
- `/working`: the decision tree walked as questions, ending in a dated personal summary
  (including the HSA stop-date card).
- `/learn`: the rules explained with citations (medicare.gov/SSA links throughout; "the
  official plan finder is at medicare.gov" appears here and in settings — naming the
  official tool is part of the trust posture).
- `/settings`: data-year banner (premiums change annually), reminders management,
  disclaimers, Claiming Age + HSA/FSA Vault cross-mentions.

## 4. Phases & acceptance criteria

1. **Engine:** windows + penalties + decision tree + HSA timing; oracle examples green;
   month-convention code shared with `engine-ssa` where applicable.
2. **App:** onboarding <3 min; timeline; penalties; working tree with dated summary.
3. **Reminders:** ladder E2E (killed app, reboot reconcile — life-admin standard applied
   here).
4. **Copy & compliance audit:** §6 checklist — this gate is the release blocker.
5. **Release:** EAS, listing (§5), "no data collected."

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Sixty-Five: Medicare Dates
- **iOS subtitle:** Windows, penalties, no sales
- **iOS keyword field:** medicare,enrollment,part b,penalty,65,retirement,deadline,iep,hsa,turning
- **Play title:** Sixty-Five: Medicare Dates
- **Play short description:** Your Medicare enrollment windows & penalty math. Nothing to sell you.
- **Keyword targets:** primary "medicare enrollment", "turning 65 medicare"; long-tail "do I need part b if still working", "medicare late penalty calculator", "HSA and medicare 6 month rule".
- **Play long description — first two lines:** "Every Medicare 'guide' online wants to sell you a plan. Sixty-Five just computes your dates: your personal enrollment windows, what late penalties really cost per month for life, the working-past-65 rules, and the HSA cutoff — with reminders before anything closes."
- **Screenshot story:** the personal window timeline → lifelong-penalty dollars card → the HSA stop-date card → "nothing to sell you" stance shot.
- **Launch channels:** r/medicare (broker-weary by nature — the no-sales posture is the pitch), r/AgingParents and r/retirement (with Claiming Age), HR/benefits newsletters (benefits admins field turning-65 questions constantly and can't recommend brokers — a neutral tool is exactly what they can hand out), SHIP counselor programs (the state volunteer counselors — genuine alignment; a one-pager for them is the counselor-channel play).
- **Review prompt moment:** after reminders are set for a computed window (plan-in-place moment). Excluded: any session where the penalty calculator showed an already-incurred penalty.
- **Pro candidates & anchor:** spouse timeline, PDF summary for the SHIP/benefits meeting; one-time $5.99.
- **Web/SEO queries:** "do I need medicare part b if I have employer insurance", "medicare part b penalty calculator", "HSA contributions before medicare 6 month rule", "COBRA and medicare part b trap". Each is an evergreen high-stakes query currently answered by brokers.

## 6. Compliance & marketing care (release gate)

- CMS's marketing rules regulate entities selling or steering Medicare plans. We never
  discuss, compare, name, or link any plan or carrier — the app is dates-and-arithmetic
  about the *federal program rules*, which is educational publishing, not plan marketing.
  The copy audit verifies: no plan names, no premium comparisons beyond the published
  standard Part B/D figures, no "help choosing" language anywhere.
- "Medicare" is used descriptively; no CMS/medicare.gov visual affiliation (the Claiming
  Age SSA rule applied verbatim); the disclaimer names it: "Not connected with or endorsed
  by the U.S. Government or the federal Medicare program" — this exact phrasing class is
  what legitimate publishers use; keep it on the first screen and the store listing.
- The app *names and links the official tools* (medicare.gov, SSA enrollment, SHIP
  counselors) at every decision hand-off — being the honest front door to official
  resources is both the compliance posture and the product.
