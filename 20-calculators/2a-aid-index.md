# Aid Index — Plan

**One sentence:** Estimate your FAFSA Student Aid Index from the published federal formula —
and see which inputs actually move it — before the college-planning industry gets to you.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** parents of high-school juniors/seniors (a fresh, anxious cohort every single
  year) and independent adult students. The question — "what will FAFSA say we can pay?" —
  arrives 12–18 months before the first tuition bill, at peak information asymmetry.
- **Gap:** the SAI (Student Aid Index, successor to the EFC under FAFSA Simplification) is
  computed by a **published federal formula** — deterministic, reproducible — yet the
  answer-space online is college-planning consultants and lead-gen "aid estimators" that
  harvest contact info. The Federal Student Aid estimator exists but is web-only, session-
  based, and explains nothing. Show-the-formula, offline, private: the family thesis applies
  cleanly.
- **Core jobs:** (1) "What's our SAI, roughly?" (2) "Which of our numbers actually drive it?"
  (3) "Two kids overlapping in college — what changes?" (4) "How does the timing of income
  (the prior-prior tax year) interact with when my kid starts?"

Non-goals — **the strategy wall:** no asset-repositioning or income-timing *recommendations*
(that's the consultants' pitch and it's advice; we show the formula's sensitivity like Rent
or Buy's tornado — which inputs matter is fact, what to do about them is the user's
business), no school-specific net-price predictions (institutional aid/CSS Profile methods
are proprietary — say so plainly and link each school's net-price calculator concept), no
loan products, no consultant referrals, no FAFSA filing (we estimate; studentaid.gov files).

## 2. Engine (`packages/engine-sai`)

Inputs (mirroring the FAFSA's actual data path): parent AGI and income items from the
**prior-prior tax year** (explained inline — the 2027–28 school year uses 2025 taxes; this
single fact reorients most families), untaxed income categories per the formula, parent
assets (cash/investments; **small-business and retirement-account exclusions per the current
rules — encode exactly, these exclusions answer half the folk myths**), family size, marital
status, student income/assets (with the student-asset assessment-rate difference shown —
the one planning fact that is pure formula, not strategy), independent-student paths.

Outputs:
1. **The SAI estimate** with the full derivation expandable (income protection allowance,
   employment expense allowance, asset conversion rates, the assessment brackets — every
   table from the published formula guide, cited).
2. **Sensitivity tornado** (Rent or Buy's pattern): which inputs move the SAI most for
   *this family* — typically income dominates assets, and seeing that defuses the
   asset-shuffling sales pitch better than any lecture.
3. **Multi-student view:** per-student SAI under current rules (the simplification removed
   the old sibling division — families with overlapping students need to see the new
   reality; render it factually with the rule change noted).
4. **Pell eligibility bands:** the formula's SAI-to-Pell mapping at a coarse, clearly
   labeled level ("estimates suggest likely full/partial/no Pell — studentaid.gov decides").
5. **Timeline card:** which tax year feeds which FAFSA for the student's grad year.

Oracles: the Department of Education's published **SAI Formula Guide** worked examples
(primary — encode its tables verbatim with citations); the federal estimator as a
documented cross-check. Goldens ≥60: income-protection-allowance boundaries, negative-SAI
floor cases, asset exclusions on/off, independent-student paths, family-size edges.

**Annual churn warning:** allowance tables update every award year and the formula has been
legislatively active — `tax-data` gains `sai/` per award year with its own runbook entry;
the "figures for award year 2027–28" banner is mandatory (family standard).

## 3. Screens

- `/(onboarding)`: family disclaimer + the two orienting facts up front (prior-prior year;
  federal-not-institutional scope) → guided inputs (~10 fields, grouped, all explained) →
  the estimate. Under 5 minutes.
- `/` **Estimate:** the SAI number with honest framing ("federal formula estimate — schools
  add their own aid math"), Pell band, derivation expandable.
- `/sensitivity`: the tornado + per-input sliders.
- `/students`: multi-kid overlap view with grad-year timelines.
- `/learn`: the formula rendered readable (the derivations page pattern from Claiming Age),
  every section citing the formula guide.
- `/scenarios` + `/settings`: family standards; award-year banner.

## 4. Phases & acceptance criteria

1. **Engine:** full formula + formula-guide oracle examples green; goldens; award-year data
   package with citations.
2. **App:** onboarding <5 min measured; estimate + derivation; sensitivity; multi-student.
3. **Copy & compliance audit:** the strategy wall verified in every string (Claiming Age
   gate); ED/FSA non-affiliation clean (no federal branding).
4. **Release:** EAS, listing (§5), "no data collected."

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Aid Index: FAFSA Estimator
- **iOS subtitle:** The SAI formula, shown
- **iOS keyword field:** fafsa,sai,college,financial aid,efc,pell,tuition,calculator,parents,student
- **Play title:** Aid Index: FAFSA SAI
- **Play short description:** Estimate your Student Aid Index from the real formula. Private, no lead-gen.
- **Keyword targets:** primary "FAFSA calculator", "SAI calculator"; long-tail "what will my EFC SAI be", "does retirement count on FAFSA".
- **Play long description — first two lines:** "Before anyone sells you a college-planning package, see what the federal formula actually says: your estimated Student Aid Index, derived step by step from the published rules, with a sensitivity chart showing which of your numbers really matter — offline, private, no contact form."
- **Screenshot story:** the SAI estimate with derivation open → sensitivity tornado ("income drives yours, not assets") → the prior-prior-year timeline card → "no lead-gen" stance shot.
- **Launch channels:** paying-for-college parent Facebook groups (the dominant channel for this audience), r/ApplyingToCollege's parent threads and r/Fafsa (helpful-answer presence), high-school counselor newsletters (counselors want a no-strings tool to hand parents — the pediatrician-channel logic), October FAFSA-season timing with listing live by August.
- **Review prompt moment:** after the sensitivity view is explored following an estimate (clarity moment). Excluded: sessions producing a high-SAI/no-Pell result (sour moment).
- **Pro candidates & anchor:** multi-student beyond 2, scenario packs, PDF summary for the counselor meeting; one-time $6.99.
- **Web/SEO queries:** "SAI calculator free no signup", "does 401k count against financial aid", "what tax year does FAFSA use", "EFC vs SAI what changed". The formula-explainer pages are a strong evergreen SEO surface with an annual refresh rhythm.

## 6. Risks

- Formula/table churn per award year — the versioned data package + banner discipline; a
  stale-year estimate presented as current would be genuinely harmful.
- Users conflating federal SAI with what a school charges — the "schools add their own math"
  framing appears on the estimate screen itself, not buried; institutional-methodology
  schools (CSS Profile) get an explicit "this estimate does not apply there" list concept.
- Strategy-wall erosion is the commercial temptation (consultant affiliates would pay) —
  charter line: no referrals, no repositioning advice, ever.
