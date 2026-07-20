# First Years — Plan

**One sentence:** Milestones, the vaccine schedule, and well-visit prep for your baby — sourced
from CDC/AAP, stored only on your phone, with zero ads, zero community, zero anxiety engine.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Standalone repo (`first-years`),
local-first. Copy in `local-core` patterns like Shift Life/Big Buttons.

> **Policy revision (2026-07):** per shared standards §1.2/§9, this app now includes Firebase
> Analytics + Crashlytics and AdMob banners with the Remove-Ads IAP and full consent stack —
> the "zero network / zero ads" claims in this document (including the one-sentence pitch and
> store copy) are superseded and must be regenerated at implementation (§9.5 sweep). The §9.3
> content wall is critical here: no child data, milestone statuses, or health entries ever
> appear in analytics events. Milestone/"act early" and visit-prep surfaces are ad-free
> placements per §9.1 (crisis/safety rule). The CDC/AAP-verbatim content discipline and
> anti-anxiety product rules remain fully in force.

## 1. Product

- **Audience:** parents of children 0–5, starting from the newborn fog. The most word-of-mouth
  demographic in existence (shared thesis with Recall Watch — the two cross-promote).
- **Gap:** the baby-app category is the most predatory in mobile — commercial apps (BabyCenter,
  Wonder Weeks-class, Huckleberry-class) monetize parental anxiety with content feeds,
  week-by-week fear marketing, community drama, subscriptions, and aggressive data collection
  about *infants*. The CDC's own Milestone Tracker app proves demand for the sourced content
  but is milestones-only and clunky. Nobody combines the three things pediatricians actually
  care about — milestones, immunization schedule, well-visit cadence — in a private, calm tool.
- **Positioning:** "the baby app your pediatrician would build." Every piece of content carries
  its CDC/AAP source; everything else is deliberately absent.

Non-goals: feeding/sleep/diaper logging (Huckleberry-class tracking is a different, saturated
product), content feeds/articles, community, growth *predictions*, photo journaling beyond a
simple optional memories list, any network feature at all. **The app must be fully functional
in airplane mode forever — CI enforces no network imports.**

## 2. Content datasets (`packages/domain-firstyears`) — sourced, versioned, verbatim

1. **Milestones:** CDC "Learn the Signs. Act Early." checklists (2, 4, 6, 9, 12, 15, 18, 24,
   30 months; 3, 4, 5 years) — CDC's 2022-revised wording **verbatim** (75th-percentile
   framing), each item tagged with its band and CDC's own "act early" guidance text. CDC
   materials are public domain; attribute anyway. Dataset carries CDC page/PDF source refs and
   a version stamp shown in-app ("CDC checklist revision: 2022").
2. **Immunizations:** the routine CDC child & adolescent schedule (birth–6y): vaccine, dose
   number, recommended age window. Routine schedule only — catch-up logic is explicitly out of
   scope; off-schedule states render "ask your pediatrician at the next visit" (never compute
   catch-up doses; that is clinical judgment).
3. **Well visits:** AAP Bright Futures periodicity (3–5 days, 1, 2, 4, 6, 9, 12, 15, 18, 24,
   30 mo, then annual) with a short "what usually happens" paragraph per visit (measurements,
   which vaccines typically align, what gets discussed) — paraphrased with source refs.
4. **Adjusted age for preemies:** child profile takes due date as well as birth date; when they
   differ ≥3 weeks, milestone bands use adjusted age until 24 months (per AAP convention),
   badge shown ("using adjusted age: 7 mo") — a correctness detail that instantly earns trust
   with NICU parents, whom every mainstream app fails.

All three datasets are data packages with schema tests and an annual review runbook (CDC/AAP
revisions), exactly like `tax-data`.

## 3. Domain logic

- Child profiles (multiple kids; each: name/label, dob, due date?, photo?).
- Milestone state per child per item: `not_yet | emerging | yes` + optional date/note. Band
  completion is **never scored or percentaged** — no "your child is 82%!" gamification. The
  checklist renders CDC wording, the parent marks what they've seen, and the "act early" items
  use CDC's own language with one added line: "bring this list to your pediatrician."
- Immunization state per dose: `done (date) | upcoming (window)`. The record doubles as the
  daycare-enrollment vaccine summary (see export).
- Well-visit state: upcoming window → "book it" nudge → visit prep → done (with optional
  weight/length/head entries — plain display + simple chart of entries; percentile *curves*
  are Phase 2 via WHO/CDC LMS tables as a proper golden-tested engine, published examples as
  oracles).
- **Visit Prep sheet (the sleeper killer feature):** for the next visit, one screen: questions
  the parent has jotted since last time (add-anytime notepad), milestone items marked
  "not yet/emerging" in the current band, vaccines expected this visit. Export/share as a
  one-page PDF or just show the phone in the exam room. Pediatric visits are 15 minutes;
  arriving organized is the product's emotional payoff.

**Notifications (calm, sparse, all local):** well-visit booking nudge at window-start − 3 weeks
("time to book the 9-month visit"); new milestone band opener, monthly max ("Maya turned 9
months — new checklist available"); nothing else. No daily content, no "week 34: your baby's
amygdala!" pushes, ever. Both types together will average ~1.5/month.

## 4. Screens

- `/(onboarding)`: the anti-anxiety promise ("No feeds. No ads. No cloud. Sources on every
  screen.") → add child (dob + optional due date) → today's state (current band, next visit).
- `/` **Today:** per child: current milestone band progress (counts only, no percentages),
  next well visit card, vaccine summary pill ("routine schedule: up to date through 6 mo").
- `/milestones/[child]`: band tabs; CDC-verbatim checklist items with the three-state control;
  act-early items visually calm (informational blue, never alarm red); source footer.
- `/vaccines/[child]`: schedule table (dose, window, status); "daycare summary" export button.
- `/visits/[child]`: timeline of visits; each: prep sheet (before) / record (after).
- `/prep/[visit]`: the Visit Prep sheet + question notepad.
- `/memories/[child]` (optional, humble): dated one-liners ("first laugh — at the dog"). No
  photos in MVP (the OS camera roll does photos; we do records).
- `/settings`: privacy page ("airplane-mode test us"), dataset versions + sources, export/import
  (zip; nudge after every 20 entries — losing this data hurts), sibling-apps screen.

## 5. Phases & acceptance criteria

1. **Datasets:** all three encoded with source refs + schema tests; adjusted-age math goldens
   (the ≥3-week rule, the 24-month cutoff, month boundaries around DOB day-of-month edges).
2. **Core app:** profiles, Today, milestones flow (CDC wording verified against source PDFs by
   fixture diff), vaccine table, visit timeline.
3. **Visit Prep:** notepad, auto-assembled prep sheet, one-page PDF export; daycare vaccine
   summary export.
4. **Notifications + polish:** booking nudge + band opener on killed device, reboot reconcile;
   200% font scale (sleep-deprived parents, large text); **airplane-mode full-function test in
   CI** (no network module imports — lint rule).
5. **Release:** EAS both stores. Store privacy: "no data collected" — and it's the marquee
   claim. Not listed in kids' categories (parent-facing tool); health-questionnaire care like
   HSA/FSA Vault; copy audit gate (medical-adjacent, Claiming Age standard: CDC wording
   untouched, our copy never interprets).

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** First Years: Baby Milestones
- **iOS subtitle:** CDC checklists. No ads, ever
- **iOS keyword field:** baby,tracker,vaccine,schedule,milestone,toddler,development,well visit,newborn,pediatric,private
- **Play title:** First Years: Baby Milestones
- **Play short description:** Milestones, vaccine schedule & well-visit prep. No ads, no cloud, no anxiety.
- **Keyword targets:** primary "baby milestones app", "baby vaccine schedule"; long-tail "baby app without ads and subscription", "CDC milestone checklist app".
- **Play long description — first two lines:** "The baby app your pediatrician would build: CDC milestone checklists (verbatim, with sources), the routine vaccine schedule, and a prep sheet for every well visit — stored only on your phone. No feeds, no ads, no community, no data collection. Airplane-mode test us."
- **Screenshot story:** the promise screen → CDC-sourced checklist with source footer → Visit Prep sheet ("walk in organized") → adjusted-age badge (NICU-parent trust) → "no data collected" store label framed as the hero.
- **Launch channels:** r/NewParents, r/beyondthebump, r/ScienceBasedParenting (the sourced-verbatim angle is precisely their values), r/NICUParents (adjusted-age feature — genuine fit, tread respectfully), evidence-based-parenting newsletters; long-game: pediatric practices (a one-pager for the front desk — the app makes *their* visits more efficient).
- **Review prompt moment:** after completing a Visit Prep sheet for the second time (organized-parent moment). **Excluded absolutely:** any session in which an act-early item was marked or viewed in detail — never prompt near developmental concern.
- **Pro candidates & anchor:** >2 children, percentile curves (Phase 2 engine), memories export book; one-time $5.99. Core promise (milestones/vaccines/visits for your kids) stays free forever — this app's trust position is the portfolio's halo; monetize it last.
- **Web/SEO queries:** "baby milestone app that doesn't sell data", "CDC milestone tracker vs babycenter", "what happens at the 9 month well visit", "baby apps without subscription". The well-visit "what to expect" pages double as SEO content linking to the app.

## 7. Risks

- Medical adjacency: the entire defense is *verbatim sourced content + zero interpretation* —
  any feature request that requires interpreting a child's data (predictions, comparisons,
  percentile judgments in copy) is out of scope by charter, forever.
- CDC/AAP revisions: annual dataset review runbook; version stamp in-app keeps us honest.
- The anxiety-economy competitors have marketing budgets we don't — our counter is the store
  privacy label ("No Data Collected" is a searchable differentiator parents actively seek) and
  pediatrician goodwill; both depend on never compromising the zero-network stance.
