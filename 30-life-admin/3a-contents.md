# Contents — Plan

**One sentence:** A room-by-room video and photo inventory of everything you own — timestamped,
hashed, exportable — made in an hour now instead of reconstructed from grief after a fire.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. **Directly reuses Deposit Defense's
capture/integrity/report engine** — build after it and extract the shared pieces into
`packages/local-core` (walkthrough structure, hashing, manifest, report generation) rather than
copying.

## 1. Product

- **Audience:** homeowners and renters in disaster-prone regions (wildfire, hurricane, flood,
  tornado — a growing share of the country), plus anyone whose insurer just told them to "keep
  an inventory" (they all say it; almost no one does it).
- **Gap:** insurers recommend home inventories and then offer nothing usable; the pro tools
  (Encircle-class) target adjusters at subscription prices; the incumbent is a camera roll
  nobody could reconstruct a claim from. Post-loss content reconstruction is documented as one
  of the worst parts of major claims — the fix is 60 minutes of structured capture *before*.
- **Core loop:** one guided afternoon walkthrough → a sealed inventory report → an annual
  20-minute refresh nudge → if disaster ever comes, the claim starts from evidence, not memory.

Non-goals: appraisal or valuation authority (user estimates are labeled as such), direct
insurer integrations/claims filing (export is universal; integrations are lock-in), receipts
bookkeeping (Return Window's job; link items to a receipt photo inline when the user has one),
pro/adjuster features, overclaiming legal weight (Deposit Defense's honesty discipline applies
verbatim).

## 2. Domain (`packages/domain-contents`)

Data model (sqlite):
- `properties`: id, nickname, address_text, type; multiple properties behind
  `hasFeature('multi-property')`.
- `sweeps`: id, property_id, kind (`initial | annual | after_purchase`), started_at,
  completed_at? — the video pass.
- `rooms`: sweep-linked, from templates (Deposit Defense's room model, extended with garage/
  attic/shed/storage).
- `room_videos`: room_id, file ref, duration, captured_at, sha256 — one guided 30–60 s slow pan
  per room ("open closets and drawers as you go" — the guidance script is data, per room type).
- `items`: room_id, name, category (electronics/jewelry/furniture/tools/instruments/art/
  appliances/other), est_value_cents (user's estimate, labeled), serial/model text?, purchase
  year?, photo_ids[] (close-ups), receipt photo_id?, high_value flag (auto at ≥ a user-set
  threshold, default $500).
- Integrity: capture-time hashing + manifest exactly per Deposit Defense §3 — in-app camera
  only for evidentiary media, imported media allowed but labeled `imported`.

Logic (pure, tested): per-room and per-category value rollups; the **coverage gut-check** —
user enters their policy's personal-property limit (from their declarations page) → "your
estimated contents: $47,300; your policy's contents limit: $30,000" with a neutral line
("worth a conversation with your insurer — many policies also sub-limit jewelry and
electronics; check yours"). Factual comparison, no coverage advice, no product recommendations
— copy audit applies.

## 3. Reports & exports

1. **Inventory Report PDF** — cover (property, date, method statement), per-room sections
   (video stills + item tables with values/serials), high-value schedule (the page an adjuster
   asks for first), totals by category, integrity manifest (hashes, timestamps). Fixture: 8
   rooms, 120 items, 40 photos → <60 s, <40 MB (video referenced by hash + filename, not
   embedded).
2. **Full evidence zip** — structured folders (per room: video + photos + items.json) +
   manifest + the PDF. This is the "give it to the adjuster / put it in cloud storage of your
   choosing" artifact; videos make it large — show size before export and stream it (no
   in-memory zip).
3. **Off-site copy nudge (critical and honest):** an inventory that burns with the house is
   worthless. After every completed sweep and annually: "Export the zip somewhere that isn't
   this house — your own cloud drive, a relative's computer." We never provide the cloud; we
   insist the user picks one. This nudge is a feature, not marketing.

## 4. Screens

- `/(onboarding)`: the framing ("An hour now. Or a memory test after the worst day of your
  year.") → property → start first sweep.
- `/sweep/[id]`: room list with completeness rings (video ✓ / items counted) → room screen:
  guided video capture with the script overlay, then rapid item add (name + value + optional
  close-up; warm camera, Deposit Defense pattern).
- `/` **Property:** total estimated value, coverage gut-check card (once limit entered),
  high-value list, last-sweep date with the annual-refresh state.
- `/item/[id]`: detail/edit, serial, receipt link.
- `/report`: PDF preview → generate/share; zip export with size warning + off-site nudge.
- `/settings`: family privacy page, high-value threshold, storage meter (videos are big — show
  usage honestly, offer per-room re-record at lower length), export/import.

## 5. Notifications (two, ever)

Annual refresh nudge (sweep anniversary, one push: "20 minutes keeps your inventory current")
and an unfinished-sweep nudge after 72 h (once — Deposit Defense's pattern). Both opt-in at
natural moments. Nothing else; a disaster-prep app that nags about disasters is a horror.

## 6. Phases & acceptance criteria

1. **Extraction first:** lift walkthrough/hash/manifest/report machinery from Deposit Defense
   into `local-core` with both apps' tests green — the refactor is this app's phase 1.
2. **Domain + capture:** sweep flow with guided video; 8-room fixture property captured in <75
   min by a first-time tester (measured); storage meter accurate.
3. **Reports:** PDF + streamed zip within budgets; manifest verification test (hash every file
   → match manifest); coverage gut-check math + copy.
4. **Notifications + refresh:** annual/unfinished nudges E2E; annual re-sweep flow (prior
   items carried forward, quick confirm/adjust).
5. **Release:** EAS, listing (§7), "no data collected"; copy audit (insurance adjacency —
   neutral-comparison language holds everywhere).

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Contents: Home Inventory
- **iOS subtitle:** Proof for insurance claims
- **iOS keyword field:** belongings,documentation,fire,flood,theft,video,list,valuables,disaster,records,claim
- **Play title:** Contents: Home Inventory
- **Play short description:** Room-by-room proof of what you own — before the claim needs it. Private.
- **Keyword targets:** primary "home inventory app", "home inventory for insurance"; long-tail "how to document belongings for insurance", "home inventory before hurricane".
- **Play long description — first two lines:** "After a fire or flood, insurers ask for a list of everything you owned — from memory, on the worst week of your life. Contents replaces that memory test: one guided hour of room-by-room video and photos, timestamped and hashed, exportable as the report a claim actually needs."
- **Screenshot story:** guided room sweep with script overlay → high-value schedule page → coverage gut-check card ("$47k of stuff, $30k of coverage") → the off-site copy nudge ("an inventory that burns with the house is worthless").
- **Launch channels:** r/Insurance (adjusters and agents genuinely recommend inventories — critique-first presence converts to endorsements), r/homeowners, r/preppers (pragmatic wing), hurricane/wildfire season timing (Jun–Oct) with the listing and SEO pages live *before* the season, renters-insurance content angles.
- **Review prompt moment:** after the first completed full-property report. Excluded absolutely: any session following a long gap that starts in the report/export flow (that pattern suggests an active claim — the worst possible moment).
- **Pro candidates & anchor:** multiple properties, annual-diff reports ("what changed since last year"), high-value schedule variants; one-time $6.99.
- **Web/SEO queries:** "home inventory app for insurance claims", "how to document your belongings before a hurricane", "personal property claim list tips", "home inventory checklist by room" (the room checklist doubles as an SEO page per playbook §6).

## 8. Risks

- Storage pressure from video is the top UX risk — compression guidance, the meter, per-room
  durations capped, and honest math shown before capture ("~90 MB for a typical home").
- The off-site problem: a local-only app whose artifact must survive the house — the export
  nudge discipline is the mitigation and it must never soften into a cloud-service upsell
  (that would betray the charter; the user picks their own destination).
- Claim-time usage will happen despite pre-loss positioning — the report/export path gets
  disaster-condition testing (low storage, cracked-screen reachability, one-handed) in the
  release checklist.
