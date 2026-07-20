# Balance — Plan

**One sentence:** Know exactly how much PTO you actually have, what you'll have by August,
and what you'll forfeit on December 31 if you don't book something.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** every salaried employee whose HR system is terrible (most), whose accrual
  rules are opaque (most), or who juggles multiple buckets (vacation + sick + floating
  holidays + comp time). People track this today in Notes apps and mental math — then
  forfeit hours at year-end or get denied a trip they thought they'd banked.
- **Gap:** HR systems show today's balance (sometimes, wrongly, behind a VPN); nothing
  answers the actual questions — *"will I have 40 hours by the wedding in August?"* and
  *"how much am I on track to forfeit?"* No good private tool exists; the incumbents are
  employer-side HR suites.
- **Privacy angle (real here):** vacation plans and job-search-adjacent time off are
  nobody's business — "HR can't see this either" is the stance line.
- **Core loop:** set up policies once → occasional one-tap sync to the real HR number →
  plan time off against the projection → one warning before use-it-or-lose-it bites.

Non-goals: employer/HR integrations (never — manual truth-sync is the design, not a gap),
request/approval workflows (we track, your employer approves), team calendars (personal
tool), sick-day pattern analytics (creepy; never), country-specific leave-law content
(informational rabbit hole; the engine's rules are user-entered).

## 2. Domain (`packages/domain-balance`)

Data model (sqlite):
- `policies`: id, label ("Vacation", "Sick", "Floating"), unit (hours/days), accrual method
  (`per_pay_period | monthly | lump_annual | unlimited`), accrual amount + cadence anchor
  (pay-cycle dates reuse Renewals-style anchor-day math), cap (accrual stops at N), carryover
  rule (`none | capped(N) | full`), carryover deadline (the Dec-31/Mar-31 use-it-or-lose-it
  date), effective_from (mid-year policy changes are first-class — promotions change
  accrual rates).
- `entries`: policy_id, kind (`accrual_auto | adjustment | taken | granted`), date, hours,
  note. **Adjustments are first-class**: the "sync to HR truth" flow creates an adjustment
  entry ("HR says 62.5 as of today") and the projection recalibrates from it — the
  tune-to-your-paystub pattern from Paycheck, applied to hours.
- `plans`: label ("Maui"), date range, hours per day or total, policy_id, status
  (`planned | taken | canceled`).

Projection engine (pure, golden-tested): balance on any date = last adjustment anchor +
accruals (respecting caps as they bind mid-projection) − taken − planned-before-that-date;
year-boundary carryover truncation; forfeit forecast = projected balance at deadline −
carryover allowance. Goldens: caps binding mid-year then unbinding after a vacation,
biweekly vs semimonthly anchors, lump grants + mid-year start proration, policy change
mid-year, plans spanning the carryover boundary, negative-balance rendering (borrowed PTO —
shown factually, no judgment).

`unlimited` policies get honest treatment: no balance math, just a taken-days log and a
year-comparison line ("you've taken 9 days this year") — no targets, no guilt, no
"Americans average…" content.

## 3. Notifications (two, ever)

- **Forfeit warning:** 60 and 30 days before a carryover deadline, only when the forecast
  says hours will be lost, with the number in the copy ("On pace to forfeit 24 hours on
  Dec 31 — that's three days off"). This is the app's reason to exist as a notifier.
- **Sync nudge:** quarterly, opt-in, one line ("30 seconds: does Balance still match HR?").
Deterministic IDs; local-core scheduler; **no vacation-shaming, ever** — the app never says
"you haven't taken time off lately."

## 4. Screens

- `/(onboarding)`: promise ("Your time off, actually legible. HR can't see this either.") →
  policy setup (guided: "check your last paystub or offer letter" with the common patterns
  as presets) → current balance anchor → done. Under 3 minutes.
- `/` **Balances:** card per policy — current balance, accrual line ("+4.62 h every 2nd
  Friday"), forfeit forecast pill when nonzero; planned trips strip below with their
  will-it-fit status ("Maui: ✓ covered by July 18").
- `/plan`: add/edit planned time off; the answer surface ("You'll have 43.4 h by Aug 2 —
  this trip needs 40").
- `/history`: the ledger, filterable; sync-adjustment flow lives here ("HR says…").
- `/settings`: family privacy page, policy editor, notification toggles, export/import zip,
  CSV export seam.

## 5. Phases & acceptance criteria

1. **Domain:** projection engine with the golden set (§2 list complete); anchor-date math
   shared with Renewals' utilities where sensible.
2. **App:** 3-minute onboarding measured; balances + plan + will-it-fit; sync-adjustment
   flow (<30 s).
3. **Notifications E2E:** forfeit warnings with live numbers, killed app, reboot reconcile;
   the no-shaming rule verified in copy audit.
4. **Export + polish:** zip round-trip; 200% font scale; unlimited-policy honest mode.
5. **Release:** EAS, listing (§6), "no data collected."

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Balance: PTO Tracker
- **iOS subtitle:** Accruals, caps, no forfeits
- **iOS keyword field:** pto,vacation,tracker,accrual,time off,leave,days,hours,carryover,sick
- **Play title:** Balance: PTO Tracker
- **Play short description:** Track PTO accrual, caps & use-it-or-lose-it. HR can't see this either.
- **Keyword targets:** primary "PTO tracker", "vacation time tracker"; long-tail "how much PTO will I have by", "use it or lose it vacation reminder".
- **Play long description — first two lines:** "Will you have 40 hours by the wedding in August? How much are you on track to forfeit in December? Balance models your actual accrual rules — caps, carryover, mid-year changes — and warns you before use-it-or-lose-it bites. Private, offline, and no, HR can't see it."
- **Screenshot story:** balance card with accrual line → "Maui: ✓ covered by July 18" → the forfeit warning with real hours → "HR can't see this either" stance shot.
- **Launch channels:** r/careerguidance and r/work-adjacent communities, office-worker short-video ("how much PTO do I *actually* have" is native content), year-end forfeit-season timing (Oct–Nov content, listing live by September), open-enrollment newsletter angles.
- **Review prompt moment:** after a planned trip flips to "taken" with the balance math having held (the it-worked moment).
- **Pro candidates & anchor:** >3 policies, multi-year history, CSV export; one-time $3.99.
- **Web/SEO queries:** "pto accrual calculator per pay period", "use it or lose it vacation policy reminder", "track vacation hours app private", "will I have enough PTO calculator".

## 7. Risks

- Policy variety is infinite — the escape hatch is that adjustments are first-class truth
  anchors: when the model can't express a rule exactly, quarterly syncs keep it honest
  anyway; the onboarding says so plainly.
- Projection wrongness burns trust at trip-booking time — the will-it-fit answer always
  names its anchor ("based on HR's 62.5 h on Oct 1"); staleness of the anchor is surfaced,
  never hidden.
- Guilt-tone creep (vacation shaming, streaks) is the category's gravity — charter line:
  forfeit warnings are the only editorial voice this app has.
