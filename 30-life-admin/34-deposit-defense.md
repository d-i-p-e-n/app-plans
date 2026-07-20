# Deposit Defense — Plan

**One sentence:** Timestamped move-in/move-out documentation and a professional condition report
that wins security-deposit disputes before they start.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. Fourth app in the family; heaviest
document generation.

## 1. Product

- **Audience:** the ~35% of US households that rent — concentrated bursts at lease start/end.
  One-time-use-per-lease is fine: the acquisition motion is virality ("use this before you
  sign") and app-store search at exactly the two moments people care.
- **Gap:** deposit disputes are near-universal, evidence is scattered camera-roll photos with no
  structure/timestamps anyone trusts, and nothing owns this space. Landlord-side inspection
  tools exist (zInspector-class); the renter side is empty.
- **Core loop:** new lease → guided room-by-room walkthrough (20 min) → sealed report PDF
  emailed to self + landlord (user sends it) → 14 months later: move-out walkthrough → 
  side-by-side comparison report.

Non-goals: legal advice (state deposit-law reference is Phase 6 and citation-only if built),
landlord communication/messaging, payments/rent tracking, landlord-side features (the renter
posture is the brand).

## 2. Domain (`packages/domain-deposit`)

Data model (sqlite):
- `properties`: id, label, address_text (free text, user-entered), lease_start, lease_end?,
  deposit_amount_cents?, landlord_label?
- `walkthroughs`: id, property_id, kind (`move_in | move_out | mid_lease`), started_at,
  completed_at?, device_time_note (see integrity, §3)
- `rooms`: id, walkthrough_id, template_key (`kitchen | bathroom | bedroom | living | entry |
  laundry | balcony | garage | other`), label ("Bedroom 2"), sort
- `items`: id, room_id, checklist_key (per-room template: walls, ceiling, floor, windows,
  blinds, doors, outlets, fixtures, appliances…), condition (`good | fair | damaged | n/a`),
  notes, photo_ids[]
- Room templates + per-room checklists are bundled data (tested for completeness against a
  curated reference checklist in `docs/`).

Logic: walkthrough completeness scoring ("Kitchen: 2 items unphotographed"), move-in↔move-out
item pairing for the comparison report, lease-end reminder scheduling.

## 3. Evidence integrity (the differentiator — be honest about its limits)

- Photos captured in-app via `expo-camera` only (no library imports into walkthroughs; imports
  allowed only into a separate "extra evidence" pouch, labeled as imported).
- Each photo records: capture timestamp, walkthrough/room/item linkage, and sha256 hash at
  capture (photo-store feature from local-core).
- The report includes a manifest page: every photo's filename, capture time, and hash, plus the
  statement of method ("captured in-app; hashes computed at capture; original files unmodified").
- **No blockchain, no notarization theater, no overclaiming**: the report never says "court-
  admissible" or "tamper-proof" — it says "systematically documented." A structured, hashed,
  timestamped, complete walkthrough beats a camera-roll shoebox in any deposit negotiation;
  that's the claim, and it's true.
- Optional coarse location line (user-toggled, off by default) using one-shot `expo-location`
  at walkthrough start — the only location use in the family; manual address is the default.

## 4. Report generation (`expo-print` HTML → PDF)

- **Move-in report:** cover (property, dates, parties as entered), per-room sections (checklist
  table with conditions + notes, photo grid with captions/timestamps), manifest page. Clean,
  monochrome-friendly, ~letter layout; 300-photo fixture must generate <60 s and <40 MB
  (downscale in-report; full-res stays in the vault/zip export).
- **Comparison report (move-out):** per item: move-in photo | move-out photo | condition delta |
  notes — only deltas flagged `damaged`/changed appear in the summary table ("3 items changed
  condition"). This document is the product's whole reason to exist; design it first
  (HTML fixture before any UI).
- Share via sheet; nudge: "Email this to yourself today — that timestamps it with a third party
  (your email provider)." Honest, free, effective.

## 5. Screens

- `/(onboarding)`: promise ("20 minutes now beats losing $2,000 later") → add property → start
  move-in walkthrough.
- `/` **Properties:** cards with walkthrough status, lease dates, deposit amount; lease-end
  countdown when set.
- `/walkthrough/[id]`: room list with completeness rings → room screen: checklist items, each
  with condition segmented control + camera button (camera stays warm between items — speed
  matters); "add room" from templates.
- `/report/[walkthrough_id]`: preview → generate/share; comparison variant when both
  walkthroughs exist.
- `/property/[id]`: documents (generated PDFs kept in vault), extra-evidence pouch, edit.
- `/settings`: family privacy page, export/import zip, location toggle default-off, "what this
  report is and isn't" honesty page.

## 6. Notifications (minimal)

Only two, both opt-in at natural moments: (1) lease_end − 30 days: "Move-out walkthrough time —
comparison report needs matching photos"; (2) an unfinished walkthrough >48 h old: single
"finish your walkthrough?" nudge, once. Deterministic IDs; nothing else, ever.

## 7. Phases & acceptance criteria

1. **Report-first:** comparison + move-in report HTML templates rendered from fixture data
   (300 photos) meeting size/time budgets — before any capture UI exists.
2. **Domain + capture:** templates/checklists dataset; walkthrough flow with warm camera; a
   full 8-room walkthrough completable in <25 min by a first-time tester (measure it).
3. **Comparison pairing:** move-out flow shows the move-in photo inline while re-shooting each
   item (ghost/reference thumbnail) — pairing acceptance: 0 manual re-linking needed for
   template items.
4. **Integrity + export:** hashing at capture, manifest correctness test (hash file → verify
   against manifest), zip round-trip.
5. **Release:** EAS, listing, privacy "no data collected"; reminder E2E.

## 8. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Deposit Defense
- **iOS subtitle:** Move-in/out documentation
- **iOS keyword field:** security deposit,rental,renter,move,checklist,inspection,landlord,apartment,lease,photos
- **Play title:** Deposit Defense: Move-In
- **Play short description:** Timestamped move-in/move-out walkthroughs. Get your deposit back.
- **Keyword targets:** primary "security deposit", "move in checklist"; long-tail "how to document apartment condition", "move out inspection app".
- **Play long description — first two lines:** "Your deposit is one dispute away from disappearing, and camera-roll photos won't save it. Deposit Defense walks you room by room with timestamped, hash-verified photos and generates a professional condition report — the systematic documentation that ends arguments before they start."
- **Screenshot story:** room checklist with camera → completeness rings → the comparison report spread → "$2,000 reasons" framing.
- **Launch channels:** college subreddits + university off-campus housing offices (Aug/May seasonality), r/Renters, TikTok renter-rights creators (a large genre — the walkthrough demo is native content), tenant-union resource lists.
- **Review prompt moment:** after a successful report generation (already §9's one sanctioned prompt — keep them identical).
- **Pro candidates & anchor:** multiple properties, mid-lease walkthroughs, report variants; one-time $4.99.
- **Web/SEO queries:** "security deposit photo documentation app", "move in checklist app with timestamps", "how to get security deposit back evidence", "move out walkthrough report pdf". Seasonal content pushes each May and August.

## 9. Risks

- Overclaiming legal weight is the trap — §3's language discipline is a release gate (copy
  audit like Claiming Age).
- Walkthrough abandonment mid-flow — resumable by design (everything saves per item), the
  single 48 h nudge, completeness rings for motivation.
- Seasonality/one-shot usage means reviews drive everything: the post-report moment (only
  after a *successful* generation) is the one acceptable place for an in-app review prompt in
  the entire portfolio.
