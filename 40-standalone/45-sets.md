# Sets — Plan

**One sentence:** A fast, offline lifting log that never asks for $80 a year — the
spreadsheet r/fitness actually recommends, as an app that respects you.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Standalone repo (`sets`).
Noise's anti-subscription thesis applied to the gym.

> **Policy revision (2026-07):** per shared standards §1.2/§9, this app now includes Firebase
> Analytics + Crashlytics and AdMob banners with the Remove-Ads IAP and full consent stack —
> the "zero network" claim below is superseded; regenerate store/privacy copy at
> implementation (§9.5 sweep). "No subscription. Ever." remains true and remains the brand.
> Placement per §9.1: the live-logging screen is a capture flow and therefore ad-free —
> banners live on history/templates/settings; §9.3 forbids weights/reps/exercise choices in
> event params (usage events only).

## 1. Product

- **Audience:** everyone who lifts with a program — beginners on starting programs,
  intermediates running 5/3/1-class templates, anyone whose current "log" is a spreadsheet
  or a notes app. The category's story is Noise's story: beloved simple loggers (Strong,
  Hevy-class) ratcheted into subscriptions and cloud accounts for what is a finished
  product — sets, reps, weight, history.
- **Gap:** the community's standing advice is literally "just use a spreadsheet." A
  one-time-purchase-ready, offline, no-account log with excellent in-gym ergonomics is the
  gap the subscription ratchet created.
- **Core loop:** open template → log sets with one thumb between efforts → rest timer runs
  itself → PRs surface themselves → history answers "what did I lift last time" instantly.

Non-goals — **the anti-treadmill wall (Noise §1 applied):** no AI coaching, no form-check
video, no social feeds/leaderboards, no program marketplace, no content library, no
accounts, no cloud sync (export/import + device-backup is the story; a share-code template
exchange is Phase 6 at most). Cardio/GPS tracking: out (different product; a simple
duration/distance manual entry row exists for honesty, nothing more). Wearables: out of
MVP; HealthKit/Health Connect **write-only** workout export is Phase 2 (user-initiated,
never a login).

## 2. Domain (`packages/domain-sets`)

Data model (sqlite):
- `exercises`: bundled dataset (~250: barbell/dumbbell/machine/cable/bodyweight staples,
  written in-house — no scraped lists; muscle-group tags, bar-weight hints) + user customs.
- `templates`: named routines (exercise order, target sets×reps or rep ranges, optional
  %-of-training-max targets for 5/3/1-class programs — training maxes stored per exercise).
- `workouts`: started_at, template?, notes; `sets`: workout_id, exercise_id, weight, reps,
  RPE?, warmup flag, superset group?, completed_at.
- `records`: computed per exercise — best weight×reps, best estimated 1RM (Epley and
  Brzycki, both shown; the formula choice displayed, never hidden — calculators-family
  show-your-work DNA), best volume day. Pure functions, golden-tested (the one place a
  fitness app has real math; get it boringly right).

**The in-gym ergonomics bar (the product, phrased as acceptance criteria):**
- Repeat last set: **one tap**. New set with tweaked weight: ≤3 taps (plate-math stepper:
  ±2.5/5/10/25/45 chips, not a keyboard).
- "What did I do last time?" visible inline on every exercise header (last session's
  sets — the single most consulted datum in any gym).
- **Plate calculator** on every weight field (the beloved tiny feature: "185 lb = 45+25 per
  side on a 45 bar"; bar weight per exercise hint, kg/lb per-gym toggle).
- Rest timer: auto-starts on set completion (per-exercise default duration), local
  notification chime + haptic when backgrounded, never blocks logging the next set early.
- Whole flow one-handed, big targets, high contrast, screen-on-friendly (shared standards
  a11y floor is also the sweaty-hands floor).

## 3. Screens

- `/` **Today:** start-from-template buttons + resume-in-progress card; recent workouts.
- `/workout/[id]` **Live logging (the app):** exercise cards with last-time inline, set
  rows, the stepper, rest-timer bar, finish → summary with any PRs celebrated once
  (confetti-free; a quiet "3 rep PR" pill — the brand does not scream).
- `/templates`: builder (search exercises, targets, supersets); starter templates bundled
  (full-body, upper/lower, 5/3/1-class skeleton — generic, no branded program content;
  program *names* are trademarks, structures are math).
- `/exercise/[id]`: history list + per-exercise chart (est. 1RM and volume over time,
  react-native-svg), records, notes ("belt from 225").
- `/history`: calendar heat-strip + workout list.
- `/settings`: units (kg/lb, per-gym), bar weights, rest defaults, export/import (zip + CSV
  — the spreadsheet crowd's trust feature: their data walks out freely), privacy page
  (zero network, CI-enforced like First Years), entitlements seam.

## 4. Phases & acceptance criteria

1. **Domain:** records/1RM math golden-tested; template/workout model; exercise dataset
   written and reviewed.
2. **Live logging:** the ergonomics bar measured on-device (one-tap repeat, 3-tap tweak,
   stopwatch-timed set entry <4 s); rest timer background chime verified killed-app on both
   platforms (Noise-grade audio/notification care).
3. **History + charts:** exercise pages, PR detection correctness against fixtures
   (deload weeks must not false-PR).
4. **Export + polish:** CSV/zip round-trip (CSV importable back — column spec in `docs/`);
   200% font scale in the rack; kg/lb integrity goldens (no drift on unit toggle).
5. **Release:** EAS, listing (§5), "no data collected" (trivially true: no network).

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Sets: Lifting Log
- **iOS subtitle:** No subscription. Ever.
- **iOS keyword field:** workout,gym,tracker,strength,weightlifting,log,routine,barbell,progress,rest timer
- **Play title:** Sets: Lifting Log
- **Play short description:** A fast lifting log that never asks for $80 a year. Offline, private.
- **Keyword targets:** primary "workout log", "lifting tracker"; long-tail "workout tracker without subscription", "strong app alternative one time".
- **Play long description — first two lines:** "Sets, reps, weight, history — a lifting log is a finished product, not an $80-a-year service. Sets logs a set in one tap, shows what you did last time on every exercise, runs your rest timer, computes your PRs, and lets your data leave as CSV whenever you want. No account. No cloud. No subscription, ever."
- **Screenshot story:** live logging with last-time inline → the plate calculator → est. 1RM chart → CSV export ("your data walks out freely") → "No subscription. Ever." stance shot (the Noise-matching brand moment).
- **Launch channels:** r/fitness and r/GYM (the "which app since X went subscription" thread is a permanent fixture — be its answer), r/weightroom (intermediates; the 5/3/1-class template support speaks to them), lifting YouTube comment culture, Show HN (local-first + anti-subscription architecture story).
- **Review prompt moment:** after the 10th completed workout (habit established). Excluded: any session where the rest-timer chime failed.
- **Pro candidates & anchor:** advanced charts (volume by muscle group), template packs beyond starters, HealthKit export (Phase 2); one-time $4.99. **Logging, history, and export stay free forever** — charter line (Snowball/Applied reasoning: never cap the core loop of a habit tool).
- **Web/SEO queries:** "workout log app no subscription", "strong app alternative free", "best lifting app one time purchase", "5/3/1 tracking app offline".

## 6. Risks

- Rest-timer/background reliability is the one hard engineering (Noise's lesson): chime
  must fire with screen off and app backgrounded across OEMs — the phase-2 acceptance
  matrix mirrors Noise's torture pass.
- Exercise-dataset quality is brand (wrong muscle tags read amateur) — in-house authorship
  + a review pass; no scraped lists (licensing + quality).
- Program-content trademarks (5/3/1, StrongLifts et al.) — ship structures and generic
  names, never branded program text; the templates say "percentage-based skeleton," and
  store metadata stays generic (playbook §1 discipline).
