# Shift Life — Plan

**One sentence:** A calendar and sleep planner that actually understands rotating shift work.

Read [../00-shared-standards.md](../00-shared-standards.md) first. Standalone repo
(`shift-life`), local-first, no backend. Reuse `local-core` patterns from the life-admin family
by copying the package in (or publishing it internally later — copy first, don't create a
cross-repo dependency for v1).

## 1. Product

- **Audience:** the ~20% of the workforce on non-standard schedules — nurses (the beachhead:
  concentrated online communities, strong word-of-mouth), EMS, manufacturing, plant operators,
  police/fire, hospitality. Couples where one partner rotates.
- **Gap:** every calendar and sleep app assumes 9-to-5. Shift workers hand-build spreadsheet
  calendars for patterns like Panama 2-2-3 or DuPont, guess at sleep timing around night
  blocks, and can't answer "when are we both off?" Existing shift apps are ad-riddled
  widget-farms with 2014 UIs.
- **Core jobs:** (1) "Enter my rotation once; show me any date instantly." (2) "When should I
  sleep around this night block?" (3) "Which days off do I share with my partner / this month?"
  (4) "Silence my phone during day-sleep."

Non-goals: shift *scheduling/swapping* with coworkers (that's enterprise WFM — Crew/When-I-Work
territory; we are the personal layer), timesheets/pay calculation (Phase 6: simple differential
estimator maybe), medical claims about sleep (guidance framed as commonly used strategies with
sources, never treatment; no diagnosis language).

## 2. Domain (`packages/domain-shift`)

**Rotation engine (the core, pure + golden-tested):**
- A rotation = anchor date + repeating cycle of day-codes: `D` (day), `E` (eve), `N` (night),
  `O` (off), with per-code start time + duration (crossing midnight handled as first-class —
  a night shift belongs to the date it *starts*).
- Presets as data: Panama (2-2-3, 12h), DuPont (4-cycle 12h), Pitman, Continental, 4-on-4-off,
  Kelly (fire 24h), fixed nights, 5/2 with rotating weekends, custom-cycle builder (arbitrary
  length up to 56 days).
- Exceptions layer: overrides per date (swap, overtime, PTO, sick) without breaking the pattern;
  `shiftOn(date) = exception ?? pattern(date)`.
- Golden tests: preset × anchor × DST-transition dates (night shift spanning spring-forward is
  the classic bug — durations must respect real elapsed hours), leap years, cycle lengths
  ≥28 days.

**Sleep-window suggester (assistive, not medical):**
- Rule-based, from published shift-work sleep-hygiene strategies (NIOSH training materials as
  the cited source): before first night → afternoon nap block suggestion; between nights →
  anchor-sleep window; after last night → short-sleep + early-night recovery pattern;
  rotation-direction note (forward rotation easier). Each suggestion carries its citation.
  Output = suggested sleep blocks rendered on the calendar, toggleable.

**Overlap math:** two rotations (mine + partner's, partner entered manually or imported via
share code — see §4) → shared-off dates, shared evenings (both home by 18:00), next 3 shared
full weekends.

## 3. OS integration (the daily utility)

- **Calendar sync (one-way out):** publish my shifts into a device calendar via `expo-calendar`
  (own calendar named "Shift Life", full rewrite-on-change semantics, idempotent by event
  external-id convention). This makes every other app in the user's life shift-aware — highest
  value-per-effort feature in the plan.
- **Local notifications:** pre-shift reminder (offset configurable, e.g. 10 h before a night
  block: "protect sleep from 13:00"), wind-down reminder before suggested sleep blocks
  (opt-in). Deterministic IDs; reconcile-on-open.
- **Day-sleep silence:** we cannot toggle iOS Focus/Android DND programmatically without deep
  platform entanglement — MVP ships a one-tap "copy my day-sleep schedule" guide to set up a
  native Focus/DND schedule (honest, works); revisit per-platform APIs post-MVP.

## 4. Partner/team sharing without accounts

Share code = compressed rotation definition (pattern + anchor + label) encoded as a QR/deep
link (`shiftlife://rotation/...`). Partner scans → their app stores a read-only copy. No server,
no sync (pattern-based rotations rarely change; exceptions don't propagate in MVP — labeled
clearly). This is the accounts-free trick that makes the couple feature possible on day one.

## 5. Screens

- `/(onboarding)`: pick preset (visual cycle strips) or build custom → anchor date ("which day
  of the pattern is today?") → shift times → done. Under 2 minutes to a working calendar.
- `/` **Month:** the hero — month grid, color-coded codes, sleep blocks as underlays (toggle),
  partner overlay (second row of dots per day), shared-off days highlighted. This screen is why
  screenshots sell the app.
- `/day/[date]`: shift detail, exceptions editor (swap/OT/PTO), sleep suggestions with
  citations.
- `/rotations`: mine + imported; editor; share-code generator/scanner.
- `/overlap`: "when are we both off" list view (next 8 weeks).
- `/settings`: calendar-sync toggle + calendar picker, notification offsets, DND setup guide,
  privacy page, export/import.

## 6. Phases & acceptance criteria

1. **Rotation engine:** presets + custom + exceptions + DST goldens; `shiftOn()` P50 <1 ms for
   any date (it runs per-cell in the month grid).
2. **Calendar UI:** month grid at 60 fps on a mid-tier Android; day detail; exceptions.
3. **Sleep + overlap:** suggester with citations; share-code round-trip (generate → scan →
   overlay) between two physical devices.
4. **OS integration:** expo-calendar publish idempotency test (run sync 3×, event count stable);
   notifications E2E incl. reboot reconcile.
5. **Release:** EAS, listing, privacy "no data collected." Nursing-community beta (TestFlight
   link seeded in 2–3 nursing forums/subreddits per their self-promo rules) before public launch.

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Shift Life: Shift Calendar
- **iOS subtitle:** Rotations, sleep, days off
- **iOS keyword field:** work,schedule,rotating,nurse,rotation,night,dupont,2-2-3,pitman,ems,12 hour,pattern
- **Play title:** Shift Life: Shift Calendar
- **Play short description:** 2-2-3, DuPont, nights — your rotation, sleep windows & shared days off.
- **Keyword targets:** primary "shift work calendar", "rotating shift schedule"; long-tail "2-2-3 schedule app", "night shift sleep schedule".
- **Play long description — first two lines:** "Every calendar app assumes 9-to-5; your life runs on a 2-2-3, a DuPont, or straight nights. Shift Life takes your rotation once, shows any date instantly, suggests sleep windows around night blocks, and answers the real question: when are we both off?"
- **Screenshot story:** preset picker → month grid with sleep underlays → partner overlap highlights → your shifts inside the phone's own calendar.
- **Launch channels:** r/nursing (the beachhead — beta here per Phase 5), allnurses.com, r/ems, r/Firefighting, manufacturing/plant Facebook groups, nursing TikTok (schedule-pain content is an established genre).
- **Review prompt moment:** after 7 days of use following calendar-sync enable, or after a successful partner share-code import — whichever comes first.
- **Pro candidates & anchor:** multiple rotations, >1 partner overlay, shift-differential estimator (Phase 6); one-time $5.99.
- **Web/SEO queries:** "2-2-3 pitman schedule calendar app", "dupont shift schedule app", "night shift sleep schedule tips app", "shift work calendar for couples". Publish per-pattern explainer pages (what is a DuPont schedule) — high-volume queries that convert perfectly.

## 8. Risks

- Custom-rotation edge cases are infinite — the explicit day-code cycle model + exceptions
  covers the real world; resist rule-DSL creep (if a pattern can't be expressed in ≤56 day
  codes, it's out of scope).
- Sleep guidance drifting into medical territory — citation-carrying rules only, copy audit at
  release (same gate as Claiming Age).
- expo-calendar permission UX on iOS (full-access prompt) — request only when the user enables
  sync, with a pre-prompt explainer screen.
