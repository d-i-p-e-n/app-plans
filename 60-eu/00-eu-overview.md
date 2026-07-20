# EU Expansion — Overview & Regulatory Framework

Strategy and regulatory groundwork for taking the portfolio into the EU. Read
[../00-shared-standards.md](../00-shared-standards.md),
[../01-growth-playbook.md](../01-growth-playbook.md), and (for calculators)
[../50-intl-calculators/00-intl-overview.md](../50-intl-calculators/00-intl-overview.md)
first — all remain binding. This document adds the EU-specific decisions and the regulatory
considerations that shape them. **Everything in §3 was assessed July 2026 — EU digital law is
moving fast; re-verify each item at build time and record findings in the repo's
`docs/eu-compliance.md`.**

Family plans: [61-calculators-germany.md](61-calculators-germany.md),
[62-quiet-alerts-eu.md](62-quiet-alerts-eu.md).

## 1. Strategy: Germany-first beachhead

The EU is not one market. The beachhead is **Germany**: the largest economy, the strongest
personal-finance community culture (r/Finanzen is large and Bogleheads-like; the
Finanztip/Finanzwesir educational ecosystem primes exactly our audience), ad-farm-dominated
incumbent calculators, and — decisively — the finance ministry **publishes the wage-tax
computation as an algorithm spec** (the Programmablaufplan, §61 plan), giving us the best
oracle in the entire portfolio. France, the Nordics, and others follow only after Germany
proves the model, each with its own investigation (language law, local advice regulation,
data sources).

**Language commitment (unlike India):** German-market apps ship **German-first** — UI, store
listing, screenshots, support pages. English as secondary. This is a real localization cost;
the plans budget for it (i18n scaffolding from day one in EU repos, no retrofits).

**Which families travel, in order:**
1. **Calculators** — local-first, no personal-data processing, GDPR-trivial; only the
   advice-regulation wording needs care (§3.5). Germany plan: §61 doc.
2. **Quiet-alerts** — real EU data sources exist (Safety Gate, RASFF, MeteoAlarm, BfArM) but
   the backend processes personal data (device tokens), so the GDPR work in §3.1 applies in
   full. Plan: §62 doc.
3. **Life-admin / standalone** — architecturally GDPR-trivial (on-device), but dataset-heavy
   apps (merchant policies, home tasks, crop calendars) need per-country data rebuilds;
   deferred. **Noise** is the exception: zero-network, zero-notification, and sound is
   language-light — an easy early EU release (German store listing only) once the EU store
   presence exists; no separate plan needed beyond localized metadata.

## 2. Structural decisions

- Repos: `calculators-de` (mirrors the family layout), `quiet-alerts-eu` (own repo **and its
  own Supabase project in an EU region** — Frankfurt — for data-residency clarity and blast-
  radius separation from the US project).
- Pricing anchors: €3.99–€9.99 one-time (calculators/life-admin model unchanged); quiet-alerts
  Supporter €5.99/yr class. Store VAT is handled by Apple/Google as merchant of record —
  one genuine simplification.
- `quiet-site` gains `/de/...` pages, German-language, same umbrella domain (playbook §6
  reasoning unchanged).

## 3. Regulatory framework (the point of this document)

### 3.1 GDPR — a tailwind, but with concrete obligations

The portfolio's architecture (local-first, no accounts, no analytics, data minimization by
design) is close to best-case GDPR posture, and **"GDPR-konform by architecture" is a
first-class marketing claim in Germany** — make it, and make it true. Concrete obligations:

- **Local-only apps** (all calculators, life-admin, Noise): no personal data leaves the
  device → no processing by us as controller in the normal operation. Still required: a
  privacy policy (both stores require one anyway) stating exactly this, an **imprint/
  Impressum** for Germany (§5 DDG — provider identification is mandatory on commercial
  apps/sites regardless of data processing; name, address, contact — a real personal-privacy
  tradeoff for a solo developer; a serviceable business address solution is a launch
  prerequisite, decide before first German release).
- **quiet-alerts-eu backend**: we are a controller processing device tokens, coarse location
  cells, and subscription topics. Required: EU-region hosting (done by §2), a signed DPA with
  Supabase (standard), records of processing (Art. 30 — small-scale but write it), lawful
  basis mapping (consent via explicit push opt-in; legitimate interest for bare device
  registration — document the balancing test), erasure paths (already built — device deletion
  RPCs; verify cascade completeness), and breach-notification readiness (72h — a one-page
  runbook).
- **Art. 27 EU representative:** a controller not established in the EU offering services to
  EU users generally needs a designated EU representative. **This is a real cost/complexity
  gate for quiet-alerts-eu** (representative services run a few hundred €/yr) — budget it, or
  establish EU presence; either way it is a launch checklist item, not a footnote. Local-only
  apps with genuinely no processing avoid this — one more reason calculators go first.
- **No consent banners needed anywhere** — we run no cookies, no trackers, no third-party
  SDKs. The absence is both compliance and brand. Never add a CMP; if a future feature would
  require one, the feature is out of charter.
- **Breach Watch EU is deliberately deferred**: storing EU users' email addresses makes the
  full controller-obligation stack (plus Art. 27) load-bearing for one app; revisit only
  after the EU backend has operated cleanly for two quarters.

### 3.2 European Accessibility Act (EAA, in application since June 2025)

The EAA imposes accessibility requirements (EN 301 549 / WCAG-class) on covered consumer
services including e-commerce elements. Two mitigations apply to us: the portfolio's
accessibility floor (shared standards §8.8) already targets this level, and the
**microenterprise exemption** (service providers under 10 staff and ≤€2M turnover are exempt
from the service obligations) likely applies to a solo developer. Position: build to the
floor regardless (it's the right product call — Big Buttons proves we believe it), document
EN 301 549 self-assessment informally per app in `docs/`, and re-verify the exemption's
applicability at each launch (national transpositions vary in detail).

### 3.3 Cyber Resilience Act (CRA — obligations phasing in through Dec 2027)

The CRA covers "products with digital elements" placed on the EU market — consumer apps are
in scope. Main obligations (security-by-design, vulnerability handling process, disclosure
contact, update provision) land fully around **December 2027**. Our posture is naturally
close (no network surface in most apps; minimal dependencies; the quiet-alerts backend is
the main surface). Action now: a `SECURITY.md` + disclosure contact per repo, dependency-
audit CI (already family standard), and a calendar entry to do a proper CRA conformance
review **before mid-2027** for anything on the EU market. Do not ship new EU apps in late
2027 without that review.

### 3.4 Medical Device Regulation (MDR) — stay out of scope, provably

Health-adjacent apps (Health Binder, First Years, Shortage Watch) must not meet the MDR's
software-as-medical-device definition (software intended for diagnosis, prevention,
monitoring, prediction, treatment). Our no-interpretation walls (Health Binder §1, First
Years §7) keep intended purpose at "record-keeping and factual status display" — which is
the correct side of the line. EU-specific action: write an **intended-purpose statement** per
health-adjacent app in `docs/mdr-scope.md` (one page: what the app does, what it never does,
why that's outside MDR Art. 2), and have the copy audit enforce it. Shortage Watch EU (§62)
displays regulator-published supply status — factual, but the statement gets written anyway.

### 3.5 Financial/tax/legal advice regulation (national, not EU-level)

Germany specifically: **tax advice is a protected activity (StBerG)** — restricted to
licensed advisers; **legal advice similarly (RDG)**. Educational calculators showing
published formulas are established practice and fine, but the wording discipline the
portfolio already has (Claiming Age/Headroom standard) becomes legally load-bearing:
`"Keine Steuerberatung, keine Rechtsberatung, keine Anlageberatung"` disclaimers, no
personalized recommendations anywhere, and the German copy audit checks against these
categories explicitly. Investment-advice boundaries (WpHG/BaFin scope) are avoided the same
way Headroom avoids them: comparisons under stated assumptions, never "you should."
Elterngeld (a social-benefit calculator) additionally never advises on claiming strategy in
its own voice — it lays out the rules' arithmetic (§61).

### 3.6 The rest, briefly

- **DMA:** alternative iOS distribution exists in the EU; irrelevant at launch, a possible
  later channel — note only.
- **DSA:** platform-oriented; our apps host no user-generated content — out of scope.
- **Consumer withdrawal rights** for digital purchases: handled by Apple/Google as merchant
  of record; our one-time-Pro model has no subscription-cancellation complexity.
- **Language laws** (e.g., France's Toubon): consumer information in the local language —
  German-first policy already exceeds this for Germany; a France launch would require
  French-first, which is precisely why countries are sequenced one at a time.

## 4. Sequencing

1. `calculators-de` flagship (Brutto-Netto) — no backend, no Art. 27 question, proves the
   German-language operation end to end (store, support, copy audits in German).
2. Remaining German calculators; Noise DE metadata release alongside.
3. `quiet-alerts-eu` (DE-first data sources) — after the GDPR checklist in §3.1 is fully
   ticked, Art. 27 representative decided, and the Supabase EU project stood up.
4. France/Nordics/others — each gets its own investigation doc before any planning; do not
   pattern-match Germany onto them.
