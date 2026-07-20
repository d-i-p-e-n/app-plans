# Expiry Vault — Plan

**One sentence:** Every expiring document in your household — passports, licenses, registrations,
certifications — reminded early enough to actually renew without a crisis.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Build first in the family's second
wave — it is nearly pure reuse of `local-core` (reminder ladders + optional photos).

## 1. Product

- **Audience:** everyone (documents expire universally), with acute personas: travelers (the
  six-month passport-validity rule ruins trips daily), parents (kids' passports last only 5
  years), licensed professionals (nurses' certs — RN license, BLS/ACLS — with employer
  deadlines), immigrant households (visa/EAD/green-card dates, handled with extra care).
- **Gap:** these dates live in a drawer. Calendar apps technically work but nobody sets up the
  *ladder* of reminders each document type actually needs (a passport reminder 2 weeks out is
  useless — renewal takes 6–10 weeks and many countries refuse entry under 6 months validity).
  The lead-time knowledge *is* the product.
- **Core loop:** 60-second add per document → years of silence → the right reminders at the
  right lead times → "renewal started" → done, next cycle.

Non-goals: storing document *numbers* (same ≥8-consecutive-digits refusal as Renewals — label
fields only, e.g. "ends in 4821"), cloud sync (export/import per family standard), renewal
*execution* or form-filling, DMV appointment booking.

## 2. Domain (`packages/domain-expiry`)

Data model (sqlite):
- `documents`: id, type_key, label, holder_label (free text: "me", "Maya"), expires_on,
  issued_on?, photo_ids[] (optional, with an explicit warning before first photo: "stored only
  on this phone — still, think before photographing sensitive documents"), renewal_state
  (`idle | started | done`), renewal_started_at?, notes.
- `document_types` (bundled dataset — the product's crown jewel): type_key, display name,
  category, default reminder ladder (days before expiry), rationale copy (one sentence shown
  with each reminder), typical renewal duration, official renewal URL (federal-level only in
  MVP: travel.state.gov, TSA, CBP Trusted Traveler; per-state DMV URL table is Phase 2 data).

Launch type dataset (each with sourced lead-time rationale):

| Type | Ladder (days before) | Why |
|---|---|---|
| Passport (adult) | 365, 270, 180, 90 | Six-month validity rule + 6–10 week processing; the 365 nudge explains the rule |
| Passport (child, 5y) | 270, 180, 90 | Same rule, shorter cycle, parents forget |
| Driver's license | 60, 30, 7 | Some states allow early online renewal |
| Vehicle registration | 45, 14, 3 | Late fees are immediate |
| Vehicle inspection | 30, 7 | State-dependent; user sets date |
| Trusted Traveler (Global Entry/PreCheck/NEXUS) | 365, 180, 90 | Renewal window opens 1 year early; say so |
| Professional license/cert (RN, BLS, ACLS, PE, bar, teaching…) | 120, 60, 30, 7 | CE requirements need runway; fully custom-ladder friendly |
| Insurance card (auto/health) | 21, 7 | Usually auto-renews; reminder is "new card arrived?" |
| Immigration (visa, EAD, I-94, green card) | 270, 180, 120, 60 | Long processing; extra-sensitive handling (§3) |
| Custom | user-defined | Anything with a date |

Logic (pure, tested): ladder → scheduled notifications via local-core (deterministic IDs
`{doc}:{days}`); "renewal started" pauses remaining ladder and sets a gentle 30-day follow-up
("did the new one arrive? update the date"); completing rolls the document to its next cycle
(new expiry entered). Household view math: documents grouped by holder; "family passport check"
computed status (all valid ≥6 months through a user-entered trip date — the killer pre-booking
feature: "Can we book flights for March? → Maya's passport will be at 4 months validity ⚠").

## 3. Immigration-document care

These users face real stakes and justified data anxiety. Rules: the type exists (pretending it
doesn't helps no one), copy never speculates or advises (no "you should file X" — reminder
dates and official USCIS/State links only), photos discouraged for these types specifically
(inline note), and the privacy page explicitly addresses this category ("on this phone only;
no cloud, no account, no analytics — verify us: airplane mode works"). Copy audit gate applies
(Claiming Age standard).

## 4. Screens

- `/(onboarding)`: promise ("Renewals take longer than reminders think. We know the real lead
  times.") → add first document (type picker with search → date → holder) → done.
- `/` **Vault:** grouped by holder; each row: type icon, label, status pill (green "3 yrs" /
  amber "renew soon" / red "expired" — red is factual, not shaming); "Trip check" button top-right.
- `/add` + `/doc/[id]`: type-driven forms; the ladder shown and editable at add time ("we'll
  remind you: next March, June, September"); renewal-started flow.
- `/trip-check`: enter a trip date + who's going → pass/warn per traveler against the 6-month
  rule. Shareable as a screenshot (organic marketing surface).
- `/settings`: family privacy page (+ §3 paragraph), export/import, notification hour, type
  dataset attribution note.

## 5. Phases & acceptance criteria

1. **Type dataset + domain:** the table above encoded with rationale strings and source notes
   in `docs/`; ladder/renewal-cycle/trip-check logic golden-tested (leap-day expiries,
   same-day-multiple-docs batching into one notification, paused-ladder edge cases).
2. **App:** add flow <60 s; vault; doc detail; trip check; ladders editable.
3. **Notifications E2E:** device-killed delivery of a ladder step with rationale copy; renewal-
   started pause/follow-up; reboot reconcile; same-morning batching ("2 documents need
   attention") verified.
4. **Export + polish:** zip round-trip; 200% font scale; holder grouping with 10+ docs.
5. **Release:** EAS, listing (§6), privacy "no data collected."

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Expiry Vault: ID & Documents
- **iOS subtitle:** Passport & license reminders
- **iOS keyword field:** passport,renewal,expiration,tracker,drivers,registration,global entry,visa,certificate,date
- **Play title:** Expiry Vault: ID & Documents
- **Play short description:** Passports, licenses, certs — reminded early enough to actually renew. Private.
- **Keyword targets:** primary "passport expiration reminder", "document expiry tracker"; long-tail "six month passport rule reminder app".
- **Play long description — first two lines:** "Renewals take longer than your calendar thinks. Expiry Vault knows the real lead times — the six-month passport validity rule, 10-week processing, early renewal windows — and reminds your whole household in time."
- **Screenshot story:** family vault grouped by holder → the 365-day passport nudge explaining the 6-month rule → Trip Check pass/warn screen → "on this phone only."
- **Launch channels:** r/travel (six-month-rule horror threads are constant), r/Flights, points/miles communities, nursing communities (cert ladders — cross-promote with Shift Life), immigration communities only via genuinely helpful presence (extra care, no growth-hacking).
- **Review prompt moment:** after a Trip Check returns all-green for a family (relief moment), or after first "renewal done" cycle completes. Excluded: any red/expired context.
- **Pro candidates & anchor:** unlimited documents (free cap ~15), household share-code export, per-state DMV link pack; one-time $4.99.
- **Web/SEO queries:** "app to track passport expiration for family", "six month passport validity rule which countries", "how early can I renew global entry", "nursing license renewal reminder app".

## 7. Risks

- Lead-time dataset accuracy is the brand — every ladder rationale carries a source note and
  the quarterly review runbook covers processing-time drift (State Dept times change).
- Trip Check must be conservative (warn at <6 months + 2-week buffer) and say why — a false
  "all good" that strands a family is the catastrophic failure mode; golden-test the boundary.
- Overlap with Glovebox (registration/inspection) is intentional — both link to each other via
  the cross-promo screen rather than fighting over scope.
