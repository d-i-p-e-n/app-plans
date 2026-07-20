# Ladder — Plan

**One sentence:** Build and track a T-bill/note/CD ladder without fighting TreasuryDirect's UI.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first.

## 1. Product

- **Audience:** retail savers who moved cash into T-bills/CDs when rates rose and are managing
  ladders in spreadsheets; emergency-fund optimizers; retirees laddering known expenses.
- **Gap:** TreasuryDirect's UX is infamous; brokerages bury fixed income; no clean mobile tool
  does "design the ladder, understand the math, track the rungs, know what to do at each
  maturity." Deterministic math + niche passionate audience = very OptionPricer-shaped.
- **Core jobs:** (1) "I have $40k — build me a 6-rung 12-month bill ladder; what does each rung
  pay and when?" (2) "What's my blended yield vs my HYSA?" (3) "A rung matures Thursday — remind
  me and show my reinvest options." (4) "CD vs Treasury at my state tax rate?"

Non-goals: brokerage/TreasuryDirect integration (never — no credentials, per charter), secondary-
market pricing/quotes, corporate/muni bonds (Phase 7), TIPS math (Phase 6 — real yield + index
ratio complexity deserves its own phase), auto-roll execution (we remind; the user acts).

## 2. Engine (`packages/engine-ladder`)

Inputs: total amount OR per-rung amounts; instrument mix per rung (T-bill 4/8/13/17/26/52-week,
notes 2–10y for longer ladders, CD with APY/term, HYSA baseline rate); rung count + spacing
(weekly/monthly/quarterly); user's federal marginal rate + state rate (for the tax-equivalence
math — Treasuries are state-tax-exempt, the single most misunderstood retail fact); purchase
mechanics (auction discount for bills: price per $100, investment rate).

Outputs:
1. **Ladder design:** per rung: instrument, purchase date/auction date guidance, amount,
   indicative rate (from user-entered or fetched yields), maturity date, interest earned.
2. **Blended metrics:** weighted average yield, tax-equivalent yield vs HYSA/CD at user's rates
   ("your 4.10% HYSA is really 3.42% after your taxes; this ladder nets X"), liquidity profile
   (rolling: cash available every N weeks).
3. **Roll simulation:** if rates stay at scenario levels, ladder value/income over 1–3 years;
   scenario shifts (rates ±100bp at reinvest) — deterministic given inputs, no forecasting
   language.
4. **Bill math done right:** discount price ↔ investment rate (Coupon Equivalent Yield) using
   Treasury's actual/360 discount and actual/365(6) CEY conventions; `finmath` day counts.

Oracle tests: TreasuryDirect's published price/rate worked examples per bill tenor; recent real
auction results (fixtures) — price recomputed from rate must match to the cent per $100. CD
compounding APY↔APR checks.

Goldens: ≥50 ladders — uneven rungs, leap-year, weekend/holiday maturity rolls (SIFMA holiday
table in `finmath`, committed + tested), 52-week bill in 366-day year, mixed CD/Treasury ladders.

## 3. Optional network: indicative yields (the one calculators-family fetch)

Client-side, optional, cached, degrades to manual entry:
- **TreasuryDirect auction API** (no key): recent results
  `https://www.treasurydirect.gov/TA_WS/securities/auctioned?format=json&type=Bill` and
  `.../securities/upcoming?format=json` for the auction calendar ("next 13-week auction: Monday").
- Daily par yield curve from home.treasury.gov XML/CSV feed as a fallback indicative source.
- Rules: fetch on demand, show as "indicative, as of {date}", full function without network
  (manual rate entry), no other network use in the app.

## 4. Tracking & local notifications

Saved ladders become live: each rung has a status (planned → purchased (user confirms with
actual price/rate) → matured). Local scheduled notifications (no backend):
- Auction reminder (opt-in): "13-week auction closes tomorrow — rung 3 of your ladder."
- Maturity reminder: 2 days before: "Rung 2 ($5,000) matures Thursday. Reinvest options inside."
Deterministic notification IDs (`{ladder}:{rung}:{milestone}`), reschedule-on-open safety net
(shared standards §5).

## 5. Screens

- `/(onboarding)`: disclaimer → "what are you laddering?" (amount + horizon + spacing) → generated
  ladder preview. Under 60 seconds to a full ladder.
- `/` **Ladders:** cards with next-event line ("Rung 2 matures in 6 days"), blended yield.
- `/ladder/[id]`: the rung timeline (horizontal SVG rail: today marker, rungs as posts), per-rung
  detail sheet with the full bill math shown ("$4,948.83 buys $5,000 face — here's why").
- `/design`: the builder — sliders for rungs/spacing, instrument picker per rung, live blended
  metrics; "explain this ladder" expandable that walks the whole structure in plain language.
- `/compare`: ladder vs HYSA vs single CD at user tax rates — the tax-equivalence table is the
  shareable screenshot.
- `/settings`: tax rates, holiday-calendar year coverage note, yields-fetch toggle, disclaimers.

## 6. Phases & acceptance criteria

1. **`finmath` foundations:** day counts (act/360, act/365, 30/360), SIFMA holiday table
   2020–2030, business-day rolls — exhaustively tested (this package is shared family-wide).
2. **Engine:** bill/CD/note math + oracle tests against real auction fixtures; goldens.
3. **App core:** builder, ladder view, compare; fully offline with manual rates.
4. **Yields + notifications:** TreasuryDirect fetch with graceful degradation; local reminders
   with reboot-survival verification on Android (shared standards §5).
5. **Release:** EAS, listing, "no data collected."

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Ladder: T-Bill & CD Ladders
- **iOS subtitle:** Build, understand, track
- **iOS keyword field:** treasury,bills,bonds,yield,fixed income,savings,maturity,apy,rates,hysa,invest
- **Play title:** Ladder: T-Bill & CD Ladders
- **Play short description:** Design T-bill & CD ladders, see after-tax yields, never miss a maturity.
- **Keyword targets:** primary "t-bill ladder", "CD ladder calculator"; long-tail "treasury vs CD after state tax", "t bill ladder for beginners".
- **Play long description — first two lines:** "TreasuryDirect's UX is famous for the wrong reasons. Ladder designs a T-bill or CD ladder in 60 seconds, shows the real after-state-tax yield against your savings account, explains every dollar of the bill math, and reminds you before every auction and maturity."
- **Screenshot story:** 60-second builder → rung timeline → tax-equivalent compare table (the shareable shot) → maturity reminder on lock screen.
- **Launch channels:** Bogleheads forum + r/Bogleheads (top fit), r/personalfinance, fixed-income YouTube audiences (Diamond NestEgg-class comment sections), FIRE communities.
- **Review prompt moment:** after marking the first rung "purchased" (commitment moment).
- **Pro candidates & anchor:** notes/TIPS modules (Phase 6–7), >2 tracked ladders, export; one-time $6.99.
- **Web/SEO queries:** "how to build a t bill ladder", "t bill ladder calculator app", "CD vs treasury after state tax calculator", "treasury auction schedule reminders".

## 8. Risks

- Auction-schedule assumptions drift (Treasury changes offerings) — the upcoming-auctions API is
  the source of truth at runtime; engine treats the schedule as data, not constants.
- Tax-equivalence claims must stay factual per-user math, not "Treasuries beat your HYSA"
  marketing — copy review at release.
- Notes/coupons (2y+) add accrued-interest complexity — bills+CDs are the MVP spine; ship notes
  only when the oracle tests exist.
