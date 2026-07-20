# Applied — Plan

**One sentence:** Track every job application privately — pipeline, contacts, follow-ups, and
offer prep — with no cloud, no LinkedIn login, and no way for anyone to know you're looking.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** everyone job hunting — and most acutely the **employed searcher**, for whom
  privacy is not a preference but a job-security requirement. Secondary: new grads running
  100-application sprints, and the recently laid off (treat with the same no-judgment tone as
  Snowball).
- **Gap:** the incumbents (Teal, Huntr-class) are cloud SaaS with subscriptions, browser
  extensions, and email integrations — exactly what an employed searcher shouldn't touch. The
  actual tool of record is a spreadsheet. A fast, private, local pipeline with quiet follow-up
  reminders is unserved.
- **Core loop:** apply somewhere → 20-second log → the app keeps the pipeline honest (stages,
  follow-ups, staleness) → interview notes accumulate per company → offer stage hands off to
  Paycheck What-If for the money comparison.

Non-goals: resume builders/AI cover letters (crowded, different product), job-board browsing or
scraping (never), email/LinkedIn integration (the anti-feature — its absence is the security
story), coaching/advice content, employer-side anything.

## 2. Domain (`packages/domain-applied`)

Data model (sqlite):
- `searches`: id, label ("2026 search"), started_at, closed_at? — searches are seasons; closing
  one archives its applications intact (the "round" model — people search in bursts).
- `applications`: search_id, company, role, url?, location/remote?, posted_salary_text?, source
  (board/referral/recruiter/cold), stage (`saved | applied | screening | interviewing | offer |
  rejected | withdrawn | ghosted`), stage_history (stage, entered_at — the dates power the
  stats), excitement (1–3, private), notes.
- `rounds`: application_id, kind (recruiter screen / tech / onsite / panel / final), date,
  who_you_met, prep notes, debrief notes ("questions they asked" — gold for later rounds and
  future searches).
- `contacts`: application_id, name, role, email/phone labels, notes.
- `actions`: application_id, text ("follow up with Sam"), due_on, done_at? — the only
  notification source.
- `offers`: application_id, base/bonus/equity text fields, deadline_on, notes — plus the
  "compare in Paycheck What-If" cross-promo link (no data coupling; a deep link and a sentence).

Logic (pure, tested):
- **Staleness:** applied/screening with no activity for N days (default 14) → flagged stale;
  ghost-suggest at 28 days ("mark as ghosted? — keeps your pipeline honest") — always
  user-confirmed, never automatic, never a push.
- **Stats (factual mirror, no coaching):** response rate, per-stage conversion, median days in
  stage, by-source breakdown ("referrals: 40% response; cold: 4%"). Numbers only; the user
  draws conclusions.
- **Notifications:** user-created action reminders (due-date morning) and one **opt-in** weekly
  digest ("3 actions due, 2 applications stale"). Zero unprompted motivation content; job
  searches are demoralizing enough without an app's opinion.

## 3. Screens

- `/(onboarding)`: the privacy stance ("No cloud. No LinkedIn. No email access. Your search
  stays on this phone — especially from your current employer.") → create search → log first
  application.
- `/` **Pipeline:** kanban-ish columns (or stage-grouped list on narrow screens) with counts;
  stale flags; tap-drag stage moves with auto-dated history.
- `/application/[id]`: header (company/role/links) → stage timeline → rounds with prep/debrief
  → contacts → actions. The interview-debrief notepad is the sleeper feature (nobody remembers
  round 1's questions by round 4).
- `/add`: the 20-second log — company, role, stage default applied, source chips, paste URL.
- `/stats`: the factual mirror; per-search and all-time.
- `/offers`: side-by-side offer facts + deadlines + the Paycheck What-If handoff.
- `/settings`: family privacy page, staleness thresholds, digest toggle (off), export/import
  zip, CSV export seam.

## 4. Phases & acceptance criteria

1. **Domain:** stage-history semantics, staleness/ghost-suggest logic, stats math — goldens
   including reopened applications, stage regressions (offer → interviewing happens), multi-
   search date boundaries.
2. **App:** 20-second add measured; pipeline with drag; application detail with rounds;
   search archive/reopen.
3. **Stats + offers:** stats view against a 60-application fixture; offers + handoff link.
4. **Notifications + export:** action reminders and weekly digest E2E (killed app, reboot
   reconcile); zip round-trip; CSV export.
5. **Release:** EAS, listing (§5), "no data collected"; tone audit (no-judgment rule, Snowball
   standard — verify every string, especially around rejected/ghosted).

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Applied: Job Tracker
- **iOS subtitle:** Your search, off the cloud
- **iOS keyword field:** job,search,application,interview,offer,career,pipeline,resume,hunt,notes,follow up
- **Play title:** Applied: Job Search Tracker
- **Play short description:** Track every application privately. No cloud, no LinkedIn, no one watching.
- **Keyword targets:** primary "job application tracker", "job search organizer"; long-tail "job search tracker while employed", "spreadsheet alternative job applications".
- **Play long description — first two lines:** "Searching while employed? Your tracker shouldn't live in a cloud account or a browser extension. Applied keeps your whole pipeline — stages, interview notes, contacts, follow-ups — on your phone, with quiet reminders and stats that tell you what's actually working."
- **Screenshot story:** pipeline board → 20-second add → interview debrief notes ("what they asked in round 1") → source-conversion stats → "no cloud, no LinkedIn" stance shot.
- **Launch channels:** r/jobs, r/cscareerquestions, r/recruitinghell (the ghost-tracking feature is native content there), layoff-wave timing (have the listing ready; never ambulance-chase individual threads), career-newsletter reviewers.
- **Review prompt moment:** when an application reaches the offer stage. Excluded: any session in which a rejection or ghosting was logged.
- **Pro candidates & anchor:** stats export, multi-search archives beyond 2, contact book across searches; one-time $4.99. **Active-application count stays unlimited free** — capping it during someone's job hunt is hostile; charter line, same reasoning as Snowball's.
- **Web/SEO queries:** "job application tracker private no account", "how to track job applications while employed", "job search spreadsheet template alternative", "interview notes app".

## 6. Risks

- Entry friction vs spreadsheet muscle memory — the 20-second add and paste-URL prefill are
  acceptance criteria; if logging feels slower than the spreadsheet, the app loses.
- Emotional context: rejection/ghosting flows get the tone audit's closest reading; the app
  records outcomes without commentary.
- Scope gravity toward resume/AI features is strong in this category — the non-goals list is
  the wall; a tracker that stays a tracker is the differentiation.
