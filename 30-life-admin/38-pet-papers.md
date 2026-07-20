# Pet Papers — Plan

**One sentence:** Every vaccine record, medication, and vet document for your pets in your
pocket — with a boarding-ready "kennel card" PDF in one tap.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** dog and cat households (two-thirds of US homes have a pet), most acutely: new
  puppy/kitten owners (vaccine series chaos), anyone who boards/grooms/daycares (proof-of-
  rabies demanded constantly), multi-pet homes, and foster/rescue volunteers.
- **Gap:** records live as paper printouts and vet-portal PDFs scattered across providers;
  boarding facilities demand current rabies/bordetella proof at the worst moments. Incumbent
  apps are subscription platforms (Pawtrack-class) or vet-chain lock-ins. The neutral, private,
  fast vault doesn't exist.
- **Core loop:** photograph the vet paperwork → tag it (vaccine + expiry) → silence → reminded
  before anything lapses → "kennel card" PDF whenever anyone demands proof.

Non-goals: vet-portal integrations (never), telehealth, GPS/activity tracking, food/weight
advice (a plain weight log with a sparkline exists; interpretation belongs to the vet), pet
social features, insurance sales.

## 2. Domain (`packages/domain-pets`)

Data model (sqlite):
- `pets`: id, name, species (`dog | cat | other`), breed?, dob?, sex?, weight_unit, microchip
  label? (≥8-digit refusal does NOT apply here — chip numbers are 15 digits and not financial;
  store plainly), license label?, photo_id?, vet: name/phone (labels), emergency vet:
  name/phone, archived_at? (memorialized pets keep records, lose reminders).
- `vaccinations`: pet_id, type_key, given_on, expires_on (from dataset interval, always
  editable — 1y vs 3y rabies is a vet decision), clinic, doc photo_ids[], lot/tag notes?
- `vaccine_types` (bundled dataset per species): dog — rabies (1y/3y variants), DHPP/DAPP,
  bordetella (6/12 mo), leptospirosis, canine influenza, lyme; cat — rabies, FVRCP, FeLV.
  Each: display name, typical intervals, "commonly required for boarding" flag. Sourced notes
  in `docs/` (AAHA/AAFP guideline references), "your vet's schedule wins" flag like Glovebox.
- `medications`: pet_id, name, dose text, schedule (daily times / every-N-days / as-needed),
  refills_left?, active flag.
- `visits`: pet_id, date, reason, notes, cost_cents?, doc photo_ids[].
- `weights`: pet_id, date, weight.
- `care_notes`: pet_id, category (`feeding | routine | quirks | emergency`), text — the sitter
  handoff content.

**Notifications:** vaccine expiry 30/7 days ("Biscuit's bordetella lapses May 3 — boarding
will ask for it"); medication times (local, per schedule, with per-med toggle — daily med
notifications are the one high-frequency exception in the family, justified because the user
explicitly schedules each one); refill nudge when refills_left ≤ 1 (if tracked). Batched per
morning per pet where possible; deterministic IDs.

## 3. The Kennel Card (the killer feature — design it first)

One-tap PDF per pet (or all pets) via the family PDF engine:
- Page 1: photo, name/species/breed/dob, microchip, owner phone, vet + emergency vet, current
  vaccine table (type, given, **expires**, clinic) with lapsed rows clearly marked.
- Page 2 (toggleable sections): medications with schedule, feeding instructions, routine,
  quirks/warnings ("resource-guards toys"), emergency authorization line with signature blank.
- Variants from the same data: **Boarding card** (vaccines + emergency only), **Sitter card**
  (everything), **Lost-pet flyer** (photo huge, name, chip, phone — generated in 10 seconds
  when it matters most).
- Acceptance: any variant generates in <5 s and shares via sheet; vaccine-table rows match
  vault state exactly (golden fixture test).

## 4. Screens

- `/(onboarding)`: add pet (photo, name, species — 30 seconds) → "photograph their latest vet
  records" (skippable) → vaccine quick-add from the photos.
- `/` **Pets:** card per pet — photo, next-thing line ("Bordetella due in 3 wks" / "All
  current ✓"), kennel-card button right on the card.
- `/pet/[id]`: tabs or sections — Vaccines (table with status pills), Meds, Visits, Weight
  (sparkline), Care Notes, Documents (all photos).
- `/add-vaccine`: type picker (species-filtered, boarding-flag shown) → dates (expiry
  auto-suggested from interval, editable) → clinic → photo.
- `/kennel-card/[pet_id]`: variant picker → preview → share.
- `/settings`: family privacy page, export/import, notification preferences, dataset
  attribution ("typical intervals; your vet's schedule wins").

## 5. Phases & acceptance criteria

1. **Kennel card first:** PDF variants rendered from fixture data before any capture UI
   (family's report-first discipline, like Deposit Defense).
2. **Domain + vault:** vaccine dataset with sourced intervals; expiry/status logic goldens
   (1y vs 3y rabies, overdue vs upcoming, memorialized pets excluded from reminders); pets/
   vaccines/meds/visits CRUD with photo store.
3. **Notifications E2E:** vaccine 30/7 ladder + daily med times on killed device; per-med
   toggles; reboot reconcile; morning batching.
4. **Polish + export:** lost-pet flyer <10 s from pet card; zip round-trip; 200% font scale.
5. **Release:** EAS, listing (§6), "no data collected."

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Pet Papers: Vet Records
- **iOS subtitle:** Vaccines, meds, kennel card
- **iOS keyword field:** pet,dog,cat,vaccine,rabies,health,tracker,medication,reminder,boarding,puppy,kitten
- **Play title:** Pet Papers: Pet Vet Records
- **Play short description:** Every vaccine & vet record in your pocket. Boarding-ready PDF in one tap.
- **Keyword targets:** primary "pet vaccine record app", "dog vaccine tracker"; long-tail "proof of rabies vaccine for boarding".
- **Play long description — first two lines:** "The boarding desk wants proof of rabies and bordetella — right now. Pet Papers keeps every vaccine, medication, and vet record on your phone and turns them into a kennel-ready PDF in one tap. No account, no subscription, no cloud."
- **Screenshot story:** pet card with "All current ✓" → vaccine table with expiry pills → the kennel card PDF → lost-pet flyer in 10 seconds.
- **Launch channels:** r/puppy101 (extremely active, vaccine-series questions daily), r/dogs, r/cats, r/fosterdogs + rescue orgs (a rescue handing adopters a pre-filled export is the dream distribution — build the import side well), groomer/boarder counter-cards (they benefit from customers having proof ready).
- **Review prompt moment:** after first kennel-card share (the payoff moment). Excluded: within a session where a lost-pet flyer was generated.
- **Pro candidates & anchor:** >2 pets, sitter/boarding card variants, care-notes sections; one-time $4.99.
- **Web/SEO queries:** "app to keep dog vaccine records", "what shots does boarding require", "puppy vaccine schedule tracker", "lost dog flyer maker free".

## 7. Risks

- Interval dataset must defer to vets everywhere in copy ("typical; your vet's schedule wins")
  — same discipline as Glovebox; AAHA/AAFP sourcing notes required.
- Daily med notifications are a reliability promise like Big Buttons' — same OEM
  battery-optimization test matrix before release.
- Lost-pet flyer is emotionally loaded — it must work perfectly offline and fast; test it as
  a first-class acceptance criterion, not an afterthought.
