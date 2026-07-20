# Return & Warranty Tracker — Plan

**One sentence:** Snap the receipt, get told three days before the return window or warranty
quietly expires.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. Second app in the family; first user of
the photo store.

## 1. Product

- **Audience:** everyone who has found a receipt two weeks after the return window closed.
  Heaviest users: parents (kid gear churn), gift-season shoppers, gadget buyers.
- **Gap:** email-scraping predecessors (Slice/It-class) died or got creepy; retailer apps track
  only their own purchases; nobody owns "all my return windows in one quiet place."
- **Core loop:** buy → 15-second capture (photo + store + amount + category) → forget →
  one reminder before each deadline → act or let it lapse gracefully.

Non-goals: price-drop/price-adjustment tracking (Phase 6, only if store policies can be encoded
honestly), email import (never — charter), purchase analytics/budgeting (Renewals-adjacent but
not this app), extended-warranty sales (the anti-feature; never).

## 2. Domain (`packages/domain-returns`)

Data model (sqlite):
- `purchases`: id, title, merchant, category, purchase_date, amount_cents?, photo_ids[],
  notes, archived_at?
- `deadlines`: id, purchase_id, kind (`return` | `warranty` | `extended_warranty` |
  `price_adjust`?), ends_on (date), source (`policy_default` | `manual`), status
  (`active` | `done` | `lapsed`)
- `merchant_policies` (bundled dataset, not user data): merchant name aliases → default return
  days (Costco 90/electronics 90-or-exceptions, Target 90 RedCard 120, Amazon 30, Best Buy
  15/60-member, Home Depot 90, Walmart 90…, ~40 US merchants). Committed as data with
  source-URL comments and a quarterly-review runbook note. Always editable per purchase —
  defaults are suggestions, labeled "typical policy, verify yours."

Deadline math (pure, tested): return deadline = purchase_date + policy days (calendar days,
merchant-specific carve-outs as data flags); warranty = purchase_date + N months (user picks:
90d / 1y / 2y / manual); month-end and leap-year handling via shared date utils.

Notifications (via local-core scheduler):
- Return: 3 days before + morning-of ends_on (both 09:00; second one only if window ≥7 days).
- Warranty: 14 days before expiry ("still working? claim window closes {date}").
- Deterministic IDs `{deadline_id}:{d3|d0|d14}`; done/lapsed cancels.
- Budget: no other notifications exist in this app. Zero re-engagement.

## 3. Capture flow (the whole product)

`/add`, optimized to <15 s:
1. Camera opens immediately (receipt photo; skippable).
2. One screen: merchant (type-ahead over policy dataset + recents), amount (number pad,
   optional), category chips, purchase date (default today), auto-suggested return deadline
   shown inline and editable, warranty toggle+duration.
3. Save. Confirmation shows the promise: "We'll remind you Aug 14."

Phase 2 OCR (on-device only): prefill merchant/date/amount from the photo; user confirms.

## 4. Screens

- `/` **Windows:** two groups — *Closing soon* (next 14 days, sorted), *Under warranty*.
  Each row: title, merchant, days-left pill. Tap → detail with photo, edit, "mark returned /
  keep it" (both end reminders positively).
- `/add` — above.
- `/history`: archived/lapsed, searchable (the "prove I bought this" use case — search by
  merchant, jump to receipt photo).
- `/settings`: family privacy page, export/import (zip), notification timing preferences,
  policy-dataset disclaimer.

## 5. Phases & acceptance criteria

1. **Domain:** deadline math + notification-decision tests (incl. leap/short months, same-day
   purchase-and-return, policy carve-outs).
2. **Capture + list:** add flow <15 s measured on device; Windows screen; photo store integration;
   detail/edit.
3. **Notifications E2E:** physical devices, app killed: 3-day and morning-of reminders fire;
   reconcile-on-open replaces a manually cleared schedule; Android reboot behavior verified and
   documented.
4. **History + export:** search; zip export/import round-trip test green.
5. **Release:** EAS, listing, privacy "no data collected"; merchant-policy quarterly review
   runbook committed.

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Return Window: Receipts
- **iOS subtitle:** Return & warranty reminders
- **iOS keyword field:** receipt,warranty,tracker,refund,purchase,deadline,scanner,proof,shopping,gift,expire
- **Play title:** Return Window: Receipts
- **Play short description:** Snap the receipt. Reminded before return windows & warranties expire.
- **Keyword targets:** primary "receipt tracker", "return reminder"; long-tail "app to track return deadlines", "warranty expiration tracker".
- **Play long description — first two lines:** "Found the receipt two weeks after the return window closed — again? Snap it in 15 seconds; Return Window knows typical store policies, reminds you three days before every deadline, and keeps the receipt findable for warranty claims years later. On your phone only."
- **Screenshot story:** 15-second capture → "closing soon" list → lock-screen reminder → found-the-receipt search moment.
- **Launch channels:** r/Frugal, r/BuyItForLife (warranty-keeping culture), lifehack short-video creators, holiday gift-return season content push (Dec–Jan).
- **Review prompt moment:** after marking an item "returned" before its deadline (money-saved moment).
- **Pro candidates & anchor:** unlimited items (free cap generous), warranty-claim notes, CSV export; one-time $4.99.
- **Web/SEO queries:** "app to track return windows", "receipt tracker without account", "warranty expiration reminder app", "how long do I have to return" (per-store pages from the policy dataset double as SEO content).

## 7. Risks

- Merchant policy data going stale → always-editable defaults, "verify yours" labeling, quarterly
  runbook; never present a default as a guarantee.
- Capture friction kills retention — the <15 s bar is an acceptance criterion, not aspiration;
  test with a stopwatch.
- Photo storage growth: show storage used in settings; compression at capture (family overview);
  archive keeps photos (they're the point).
