# Health Binder — Plan

**One sentence:** Your family's medical facts — medications, allergies, conditions, history — in
one private place, with a one-tap intake sheet for every new-patient clipboard.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. HSA/FSA-Vault-tier privacy posture
(no third-party SDKs at all); the adult/family sibling of First Years' visit-prep concept.

## 1. Product

- **Audience:** everyone who has copied the same medication list onto a clipboard for the 40th
  time. The killer persona: **the caregiver** — an adult child managing a parent's nine
  medications across four doctors (pairs naturally with Big Buttons); also chronic-condition
  patients, parents, and anyone who's blanked on "date of last tetanus shot?"
- **Gap:** patient portals are per-provider silos; Apple Health record sync is partial and
  provider-dependent; the actual incumbent is a folded paper in a wallet. Nothing owns the
  neutral, private, whole-family "source of truth the patient controls."
- **Core loop:** enter each person's facts once → keep meds current with two-tap edits → walk
  into any appointment, ER visit, or new-patient desk with the sheet already made.

Non-goals — **the medical-adjacency wall, absolute:** no drug-interaction checking, no dosage
validation, no symptom features, no condition content/education, no health tracking (vitals,
weight trends), no portal integrations, no interpretation of anything the user enters. This is
a structured notebook the user writes and prints, full stop. Every rejected feature above is a
liability and trust decision, documented here so future agents don't "helpfully" add them.

## 2. Domain (`packages/domain-healthbinder`)

Data model (sqlite; all free-text fields are labels the user writes — we validate nothing
medically):
- `people`: id, name/label, dob?, blood type?, photo?, primary language?, archived_at?
- `medications`: person_id, name, dose text, frequency text, prescriber label, started?,
  reason label?, active flag, discontinued_at? (history preserved — "what were you on last
  year?" is a real clinical question).
- `allergies`: person_id, allergen, reaction text, severity label (free text, not a scale we
  invent).
- `conditions`: person_id, name, since?, notes.
- `procedures`: person_id, name, year, facility label?, notes.
- `immunizations`: person_id, vaccine label, date, optional booster-interval reminder
  (user-set only — e.g., tetanus 10y; we suggest nothing).
- `family_history`: person_id, relation, condition (simple rows matching what intake forms ask).
- `providers`: person_id, name, specialty, phone; `pharmacy`: per person.
- `insurance`: person_id, carrier label, member-ID **label**, phone, card photo_ids[]
  (insurance member IDs are permitted — they're not financial credentials; card photos are the
  practical reality of every front desk).
- `contacts`: person_id, emergency contacts; `directives`: person_id, free-text *location*
  note for advance directive / POA documents ("safe, blue folder") — pointer only, never the
  document.
- `visit_notes`: person_id, date?, questions/notes (the running "ask the doctor" notepad).

## 3. The exports (the product)

All via the family PDF engine; each generated <3 s; fixture-tested layouts:

1. **Intake Sheet** — one page mirroring the standard new-patient form order: demographics,
   insurance, meds table, allergies, conditions, procedures, family history, contacts. Copy
   from it or hand it over. This is the hero.
2. **Med List Card** — wallet-size PDF and a phone-screen image sized for a lock-screen photo:
   meds/doses/allergies/emergency contact. The caregiver's ER companion.
3. **ER / Caregiver Sheet** — conditions, meds, allergies, directives-location line, contacts,
   providers — the "hand this to the paramedic" page.
4. **Visit Prep** — the questions notepad + current meds for one person, per appointment
   (First Years' proven pattern, adult edition).

Sharing note in-app, honest: "A PDF you text or email leaves this phone — share deliberately."

## 4. Notifications (nearly none)

Only user-created ones: optional refill-date reminders per medication (date entered by user,
7/1-day ladder) and user-set immunization booster reminders. No health nagging of any kind.
Deterministic IDs; local-core scheduler.

## 5. Screens

- `/(onboarding)`: privacy promise ("Medical data. This phone only. No analytics, no cloud,
  airplane-mode test us.") → add first person → guided facts entry in the intake-form order
  (familiar structure = fast completion).
- `/` **People:** card per person — med count, allergy flags (visible fast — that's the point),
  last-updated line ("reviewed 3 months ago" nudges freshness without nagging).
- `/person/[id]`: sectioned record in intake order; two-tap med edit (the most-used flow:
  dose changes); discontinue-with-history.
- `/export/[person]`: the four sheets, preview → share.
- `/prep/[person]`: the questions notepad.
- `/settings`: family privacy page (strictest language, HSA-Vault tier), export/import zip,
  backup nudge every 90 days or 20 edits, review-your-data annual nudge (in-app only).

## 6. Phases & acceptance criteria

1. **Domain + record:** schema, CRUD, med-history semantics (edit vs discontinue), fixture
   family (2 adults, 1 child, 1 elder with 9 meds) exercised in tests.
2. **Exports:** all four PDFs from the fixture family — layout review against three real
   (blank) intake forms collected in `docs/` for field-order fidelity; <3 s generation.
3. **App:** onboarding, people, person record (two-tap med edit measured), prep notepad.
4. **Notifications + backup:** refill/booster reminders E2E (killed app, reboot reconcile);
   zip round-trip; backup nudges.
5. **Release:** EAS, listing (§7), privacy "no data collected" + health-questionnaire care
   (HSA-Vault precedent; document reasoning in `docs/store-privacy-notes.md`); copy audit gate
   (medical adjacency — verify the §1 wall holds in every string).

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Health Binder: Med List
- **iOS subtitle:** Family history & intake sheets
- **iOS keyword field:** medical,records,medication,allergies,caregiver,emergency,doctor,tracker,elderly,parents
- **Play title:** Health Binder: Med List
- **Play short description:** Meds, allergies & history for your family. One-tap new-patient intake sheet.
- **Keyword targets:** primary "medication list app", "medical records app"; long-tail "medication list for elderly parent", "new patient form app".
- **Play long description — first two lines:** "You've written the same medication list on a clipboard forty times. Health Binder keeps your family's medical facts — meds, allergies, conditions, history, insurance — in one private place and turns them into an intake sheet, a wallet med card, or an ER sheet in one tap. This phone only."
- **Screenshot story:** person card with meds and allergy flags → two-tap dose edit → the Intake Sheet PDF next to a real clipboard form → caregiver ER sheet → "airplane-mode test us."
- **Launch channels:** r/AgingParents and r/CaregiverSupport (the caregiver persona is the beachhead — pair messaging with Big Buttons), r/ChronicIllness (respectful, critique-first presence), geriatric-care-manager and caregiver newsletters, pharmacist counter-cards (pharmacists beg patients for accurate med lists).
- **Review prompt moment:** after the first Intake Sheet export. Excluded: any session where the ER sheet was generated (likely a crisis).
- **Pro candidates & anchor:** >4 people, sheet variants (specialist-specific), annual review export; one-time $5.99. The core single-family promise stays free — like First Years, this app is a trust halo for the portfolio.
- **Web/SEO queries:** "medication list app for elderly parent", "app to fill out new patient forms faster", "emergency medical information sheet template", "how to keep track of parents medications". The printable-templates angle (free web versions of the sheets) is the SEO play — link magnet and honest funnel.

## 8. Risks

- Medical adjacency is the defining risk — the §1 wall plus copy audit is the control; any
  future "smart" feature request dies at this document.
- Stale data is dangerous in an ER context — the last-updated line on every export
  ("as of {date}, maintained by the patient/family") is mandatory on every sheet, not
  optional polish.
- Data loss is the catastrophic failure (a caregiver's curated record) — backup nudges are
  more aggressive here than anywhere else in the family, and the export path is tested in CI.
