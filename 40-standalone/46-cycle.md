# Cycle — Plan

**One sentence:** A period tracker that stays on your phone — no account, no cloud, no data
to subpoena or sell, ever.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Standalone repo (`cycle`),
local-only, **zero network enforced in CI** (First Years pattern). **This app carries the
highest privacy stakes and the strictest scope walls in the portfolio — §2 is the product
and §6 is a release gate.**

## 1. Product

- **Audience:** anyone who tracks a cycle and has read the news. Post-Dobbs, cycle-tracker
  data became a mainstream legal and privacy fear (subpoena exposure, data-broker sales,
  the Flo FTC settlement history); "which tracker is safe" is a recurring question with an
  unsatisfying answer set — the big apps are data businesses, and the genuinely private
  options (open-source nonprofits) are under-polished and under-marketed.
- **Gap:** the portfolio's whole identity — local-only, no accounts, provable by
  architecture — is *literally safety-relevant* here, not just preference. "No data
  collected" on the store label, zero network in CI, and a discreet mode are product
  features with real-world stakes.
- **Core loop:** log period days (two taps) → calendar shows history and an honest estimate
  window for the next one → cycle stats accumulate → nothing else happens, anywhere.

## 2. The walls (absolute; every future feature request dies against these)

1. **Not contraception, not fertility guidance.** No fertile-window prominence, no
   ovulation-based family-planning framing, no temperature/LH protocol features.
   FDA-cleared apps own that category *because clearance is appropriate for it*; our
   intended purpose — stated in-app, in store copy, and in `docs/regulatory-scope.md`
   (the 60-eu §3.4 pattern applied domestically) — is **record-keeping and calendar
   estimation**. The estimate window is labeled "period estimate," never "safe/unsafe
   days."
2. **Not diagnosis.** Symptom logging is a curated checklist with zero interpretation;
   irregularity is shown as the user's own statistics ("your last 6 cycles: 24–38 days")
   with at most "worth discussing with a clinician" — First Years' verbatim-facts
   discipline.
3. **Predictions stay humble.** Next-period estimate = simple statistics over the user's
   own recent cycles, always shown as a *range*, always with variance visible ("±4 days
   based on your last 6 cycles — bodies vary"). No proprietary-algorithm theater.
4. **Data never leaves.** No network permission use at all (CI-enforced); export is
   user-initiated file share only, with a plain warning about where they're sending it.

## 3. Domain (`packages/domain-cycle`)

- `days`: date, flow (spotting/light/medium/heavy), logged_at.
- `symptoms`: date, keys from a curated list (cramps, headache, mood entries phrased
  neutrally, sleep, custom labels), no scores, no interpretation.
- `notes`: date, free text.
- Derived (pure, golden-tested): cycle boundaries from logged days (start = first flow day
  after a gap ≥ N; the gap rule handles spotting honestly), cycle length series, average +
  spread over a 6-cycle window, estimate window for next start (median ± spread-based
  range; degrade gracefully with <3 cycles: "not enough history yet — estimates appear
  after 3 cycles" — never fake confidence), period-length stats. Goldens: irregular
  spacing, spotting-only clusters, long gaps (no logging for months → estimates suspend,
  no assumptions), editing history retroactively recomputes cleanly.

## 4. Privacy engineering (features, not settings)

- **App lock:** PIN/biometric, offered at onboarding (not buried).
- **Discreet mode:** neutral app name/icon variant (alternate-icon mechanism; verify
  current store policies allow the rename presentation — icon swap certainly is) and a
  neutral in-app skin; **free forever, never a Pro feature** (charter: safety features are
  never paywalled — the Big Buttons dignity rule's sibling).
- **Configurable notification text:** the optional "upcoming" reminder's wording is
  user-editable and defaults to something neutral ("heads up for this week") — lock screens
  are semi-public; this is Breach Watch's alias lesson applied.
- **No screenshots in app switcher** (secure-flag/blur where the platform allows).
- **Export/import:** local file only, warning copy at export; deletion is instant and
  real (drop tables, vacuum) with a "verify: airplane mode works forever" line on the
  privacy page.
- Privacy page written to be quoted: what's stored, where (a local database file), the
  zero-network CI claim, and what we could hand over if legally compelled ("nothing — we
  don't have it"). That last sentence is the entire market position.

## 5. Screens

- `/(onboarding)`: the promise, plainly ("On your phone. Nowhere else. Here's how to verify
  us.") → optional app lock setup → log recent history if known (last period start,
  typical length — seeds the calendar) → done. No questions about goals, age, or anything.
- `/` **Calendar:** month view — logged days, the estimate window shaded with its honest
  label; two-tap logging from the calendar itself.
- `/day/[date]`: flow, symptoms checklist, note.
- `/stats`: cycle-length history chart (react-native-svg), averages + spread, period-length
  stats — the user's own numbers, no benchmarks against "normal" (no norm-shaming; a
  clinician link-out line only).
- `/settings`: lock, discreet mode, notification text editor (default off), export/import,
  the privacy page, entitlements seam.

## 6. Phases & acceptance criteria

1. **Domain:** boundary/estimate math goldens (§3 list complete), including the
   degrade-gracefully cases.
2. **App:** calendar with two-tap logging measured; day/stats; onboarding <90 s.
3. **Privacy engineering:** lock, discreet mode (store-policy verification recorded),
   switcher blur, notification text editor, deletion verification test; **zero-network CI
   gate green** (build fails if any network permission/call appears).
4. **Copy + scope audit (release gate):** every string against §2's walls — the strictest
   audit in the portfolio, recorded in `docs/copy-audit.md`; the intended-purpose statement
   finalized.
5. **Release:** EAS, listing (§7), privacy questionnaire "no data collected" (provably),
   health-category store rules review.

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle. Store copy must
pass the §2 walls too (no fertility/contraception keywords — they'd be both a scope lie and
a policy risk).

- **iOS name:** Cycle: Private Tracker
- **iOS subtitle:** On your phone. Nowhere else.
- **iOS keyword field:** period,tracker,menstrual,calendar,private,discreet,offline,pms,log,secure
- **Play title:** Cycle: Private Period Tracker
- **Play short description:** A period tracker that stays on your phone. No account, no cloud. Ever.
- **Keyword targets:** primary "period tracker private", "period tracker no account"; long-tail "period tracker that doesn't share data", "offline period tracker".
- **Play long description — first two lines:** "Your cycle is nobody's data. Cycle logs periods and symptoms entirely on your phone — no account, no cloud, no analytics, zero network access enforced in our build process — with honest estimates from your own history and a discreet mode built in, free."
- **Screenshot story:** the promise screen with the verify-us line → two-tap calendar logging → the estimate window with its honest ±range label → discreet mode toggle → "what we could hand over: nothing" privacy page.
- **Launch channels:** privacy communities and press (EFF-adjacent coverage of tracker privacy is abundant and recurring — this app is the constructive answer to a story journalists rewrite yearly), r/TwoXChromosomes and women's-health communities (respectful, critique-first, never growth-hacky — this audience's trust is earned slowly and lost instantly), Show HN (the zero-network CI enforcement is the architecture story).
- **Review prompt moment:** after the third completed cycle is logged, on a calm calendar view. Excluded: any session containing symptom logging.
- **Pro candidates & anchor:** extended stats, additional themes; one-time $3.99. **Discreet mode, lock, and all logging stay free forever** (charter, §4).
- **Web/SEO queries:** "period tracker that doesn't sell data", "private period tracker no account", "is my period app data safe", "offline period tracker app". The privacy-page content doubles as the landing page.

## 8. Risks

- Trust is the entire product and it's asymmetric — one telemetry dependency slipping in
  via a transitive package would be existential; the zero-network CI gate plus a
  dependency-audit step are both release-blocking, and the privacy page invites external
  verification.
- Store-category and policy nuances for health apps shift — the §6 phase-5 review is
  explicit, and the intended-purpose statement is the answer to any store query.
- The scope walls will be tested by well-meaning feature requests (fertility mode is the
  #1 predictable ask) — the answer is written in §2 so future agents and future-you don't
  relitigate it under growth pressure.
