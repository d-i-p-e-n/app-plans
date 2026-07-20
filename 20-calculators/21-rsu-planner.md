# RSU Planner — Plan

**One sentence:** See what your equity grants are actually worth after vesting and taxes, and what
happens if the stock moves — with no one trying to sell you a loan.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first.

## 1. Product

- **Audience:** tech and tech-adjacent employees with RSU grants (public-company focus for MVP;
  private-company RSUs and options are Phase 6). High-income, underserved, chronically confused
  about sell-to-cover and under-withholding.
- **Gap:** existing tools (Secfi, Compound, brokerage plan portals) are lead-gen for loans/AUM or
  useless plan-admin UIs. Spreadsheets are what people actually use. This is "OptionPricer for
  equity comp": deterministic math, offline, shows its work.
- **Core jobs:** (1) "What vests when, and what's it worth?" (2) "How many shares actually land
  in my account after sell-to-cover?" (3) "Am I under-withheld?" (4) "What if the stock drops
  30% before my next vest?" (5) "How concentrated am I?"

Non-goals (MVP): stock options (ISO/NSO — Phase 7, big and AMT-shaped), ESPP (Phase 6), live
stock prices (user enters price assumptions — keeps app offline and avoids advice adjacency),
cost-basis tracking for tax filing, any "connect your brokerage."

## 2. Engine (`packages/engine-rsu`)

Inputs (all plain objects):
- **Grants:** id, ticker/label, grant date, total shares, vesting schedule = cliff months +
  frequency (monthly/quarterly/semiannual/annual) + duration, or an explicit custom vest-event
  list (date, shares) for irregular schedules. Support multiple concurrent grants (refreshers).
- **Assumptions:** price scenarios (named: e.g. "current $180", "bear $120", "bull $250"),
  filing status, state, other expected W-2 income, YTD supplemental wages, 401k/HSA elections
  (for the withholding-gap calc via `engine-paycheck` shared pieces where sensible).

Outputs:
1. **Vest schedule projection:** per vest event: date, shares, gross value at each price
   scenario, estimated withholding (federal supplemental 22% up to the $1M YTD supplemental
   threshold then 37%; Social Security up to wage base; Medicare + additional; state supplemental
   rate from `tax-data`), shares sold to cover (ceil to whole shares at scenario price), net
   shares landed, net value.
2. **Withholding gap:** estimated actual marginal tax on RSU income vs flat supplemental
   withholding → "you may be under-withheld ≈ $X for 2026" with the expandable derivation.
   (This single number is the killer feature; spreadsheet folk get it wrong.)
3. **Concentration:** vested-and-held + unvested at scenario price vs user-entered "other
   investable assets" → concentration %, and a table of "if the stock drops X%, your total
   portfolio drops Y%".
4. **Cliff/leave analysis:** "if I leave on date D, I forfeit N shares worth $V at scenario P."

Oracle tests: IRS Pub 15 supplemental-wage worked examples; hand-derived multi-grant fixtures
(computed independently in a spreadsheet committed to `docs/oracles/` as CSV + derivation notes).
Goldens: ≥60 scenarios including cliff edge dates, leap years, $1M supplemental crossover,
SS wage-base crossover mid-year, fractional-share policies (round-down with cash-in-lieu vs
round-up), December-vest year-boundary.

## 3. Screens

- `/(onboarding)`: disclaimer (family standard) → "add your first grant" guided form → price
  assumption. Three screens, no account.
- `/` **Dashboard:** next vest countdown card (date, shares, net-after-tax at primary scenario),
  year summary (total vesting 2026: gross/net), withholding-gap card with severity color,
  concentration card. Every number taps into its breakdown.
- `/grants` + `/grants/[id]`: grant list, editor (schedule builder with live preview of vest
  events), custom-schedule CSV-ish paste option ("date,shares" lines).
- `/timeline`: all vest events across grants, cumulative net value curve per scenario
  (react-native-svg chart, scenario switcher).
- `/scenarios`: manage price scenarios; side-by-side comparison (family standard).
- `/what-if`: the leave-date slider ("forfeit if you leave...") and the drop-X% stress view.
- `/settings`: tax year in use, filing status/state, disclaimers, export (Pro-seam), no analytics
  statement.

## 4. Data & privacy notes

Everything on-device (AsyncStorage; this is the one calculators app where the data is genuinely
sensitive — comp data). State it: "Your grants never leave this phone. No account, no cloud, no
analytics." Offer local JSON export/import for device migration (file share sheet) — that's the
backup story, deliberately.

## 5. Phases & acceptance criteria

1. **Scaffold:** family monorepo bootstrapped (this app builds it); CI green; `tax-data` y2026
   federal + 10 launch states (CA, WA, NY, TX, MA, CO, GA, NC, VA, IL) with citations.
2. **Engine:** all four output groups; oracle tests + goldens green; README documents every
   formula with its source.
3. **App:** all screens; schedule builder handles the four standard frequencies + custom list;
   scenario compare; JSON export/import round-trips.
4. **Polish:** 200% font scale audit, dark mode, breakdown views complete ("show your work"
   everywhere).
5. **Release:** EAS both stores; listing below; privacy questionnaire: "no data collected."

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** RSU Planner: Vest & Taxes
- **iOS subtitle:** Sell-to-cover, net & what-ifs
- **iOS keyword field:** equity,stock,compensation,grant,vesting,withholding,shares,espp,tech,offer,ipo,calculator
- **Play title:** RSU Planner: Vest & Taxes
- **Play short description:** What your RSUs are really worth after taxes. Offline, private, no account.
- **Keyword targets:** primary "RSU calculator", "RSU tax"; long-tail "am I under withheld RSU", "sell to cover calculator".
- **Play long description — first two lines:** "Your grant letter says one number; your bank account will see another. RSU Planner shows every vest after sell-to-cover and real withholding, flags the under-withholding gap most RSU holders discover in April, and stress-tests the stock dropping before your next vest — all on your phone, nowhere else."
- **Screenshot story:** next-vest card → withholding-gap warning with expandable breakdown → drop-30% stress test → "never leaves your phone."
- **Launch channels:** Blind (highest-fit channel), r/personalfinance (per rules), levels.fyi community, Show HN, tech-worker Discords/Slacks via members.
- **Review prompt moment:** on the second viewing of the withholding-gap breakdown (the "this app just saved me" moment).
- **Pro candidates & anchor:** stock options/ESPP modules (Phase 6–7), >3 scenarios, CSV/PDF export; one-time $9.99 (premium tier, playbook §8).
- **Web/SEO queries:** "RSU tax calculator sell to cover", "am I under withheld on RSUs", "what happens to unvested RSUs if I leave", "RSU vesting schedule calculator private".

## 7. Risks

- Withholding estimates read as tax advice if overstated — always ranges + "estimate," always
  show derivation, disclaimer discipline.
- Custom vest schedules are where real-world mess lives (monthly-after-cliff-with-uneven-first-
  tranche); the explicit vest-event-list escape hatch is mandatory MVP, not Phase 2.
- State supplemental-withholding rules vary annoyingly (some states use marginal, not flat) —
  encode per-state method in `tax-data`, not in the engine.
