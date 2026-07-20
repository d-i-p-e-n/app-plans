# Stash — Plan

**One sentence:** Every gift card, its real remaining balance, and a scannable barcode at the
register — remembered before the billions get wasted.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. The smallest app in the family —
deliberately so; it must stay a two-screen tool.

## 1. Product

- **Audience:** everyone, most acutely after every gift-giving season. Billions of dollars
  in gift-card value go unredeemed annually; the failure mode is mundane — the card is in a
  drawer, the balance is unknown, the moment at the register passes.
- **Gap:** incumbents in "gift card apps" are resale marketplaces or retailer wallets;
  general wallet apps (Apple/Google) hold *some* store cards awkwardly and track no
  balances. Nothing does the whole small job: card + live balance you maintain + barcode
  that scans + a nudge before it's forgotten forever.
- **Core loop:** get a card → 20-second add (merchant, amount, photo/code) → at the store:
  open, show barcode, tap "spent $23.40" → balance stays true → if idle 6 months, one nudge.

Non-goals: buying/selling/exchanging cards (the marketplace is the enshittified incumbent),
balance-checking integrations (no retailer APIs; manual truth like Balance's HR sync),
loyalty/points cards (different job; wallet apps do it), any server anything.

## 2. Domain (`packages/domain-stash`)

Data model (sqlite):
- `cards`: id, merchant label, initial_cents, currency, code (the gift-card number — stored
  **locally only**; note: gift-card codes are bearer instruments, so the privacy page says
  plainly "codes live only on this phone; your backup zip contains them — treat it like
  cash"), pin?, barcode_format hint, photo_ids[] (front/back), expires_on?, source note
  ("from Mom, bday 2026"), archived_at?
- `spends`: card_id, date, amount_cents, note? — balance = initial − Σspends; a "set
  balance" correction entry exists (receipt said $11.17 — truth-anchor pattern).
- The ≥8-digit refusal rule is **deliberately waived for this app only** (gift-card codes
  are the product; they are not bank credentials) — the waiver is documented here so agents
  don't "fix" it, and the compensating controls are: local-only storage, the
  treat-backup-like-cash warning, and optional app-lock (biometric) for the codes screen.

Barcode rendering: generate from the stored code in common formats (Code 128 default, QR,
EAN/UPC where the hint says so) via a small dependency-vetted renderer; **manual
brightness-boost on display** (screens at registers); fallback = large-type code display
for manual entry when scanners balk. Format mismatch is the known hard part: the add flow
lets the user photograph the original barcode too, and the display screen offers
rendered-code / photo / plain-text tabs — three chances to work at the register.

Expiry/fees: federal law floors expiry at 5 years with state variations — the app asks only
"is an expiry printed?" and reminds off that (30/7 days); an informational line links the
FTC page. No legal database, no promises.

## 3. Notifications (two, both gentle)

Idle nudge at 6 months ("Still $23.40 at Target — from Mom's birthday card") and printed-
expiry reminders. Deterministic IDs; nothing else — this app must never feel like marketing.

## 4. Screens

- `/` **Wallet:** card grid (merchant + balance large); total-value line ("$187 sitting in
  this screen"); tap → display screen.
- `/card/[id]` **Register screen:** barcode/photo/text tabs, brightness boost, balance +
  one-tap "spent…" number pad (post-purchase, 5 seconds), history, edit.
- `/add`: merchant, amount, code (type/scan/photo), optional expiry/PIN/source. <20 s.
- `/settings`: family privacy page + the bearer-instrument warning, app-lock toggle,
  export/import zip (with the like-cash warning repeated at export), archived cards.

## 5. Phases & acceptance criteria

1. **Domain + barcode:** balance ledger; barcode rendering across formats verified against
   physical scanners (grocery/retail laser + camera-based POS — a real-world test matrix in
   `docs/`, the app's only hard engineering).
2. **App:** add <20 s; register screen with the three display tabs; spend flow <5 s.
3. **Notifications + lock:** idle/expiry E2E; biometric lock on codes.
4. **Export:** zip round-trip; warning copy verified.
5. **Release:** EAS, listing (§6), "no data collected."

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Stash: Gift Card Wallet
- **iOS subtitle:** Balances, barcodes, reminders
- **iOS keyword field:** gift card,balance,tracker,organizer,store,credit,voucher,manager,scan,keeper
- **Play title:** Stash: Gift Card Wallet
- **Play short description:** Every gift card, its real balance & a barcode that scans. Never wasted.
- **Keyword targets:** primary "gift card wallet", "gift card balance tracker"; long-tail "app to keep gift cards and balances", "gift card organizer no account".
- **Play long description — first two lines:** "There's real money in your junk drawer. Stash keeps every gift card, its actual remaining balance, and a barcode that scans at the register — with one gentle nudge before a card is forgotten forever. On your phone only; your codes never touch a server."
- **Screenshot story:** wallet grid with the total-value line → register screen with barcode → the 5-second "spent $23.40" pad → idle nudge ("still $23.40 at Target").
- **Launch channels:** r/Frugal, post-holiday timing (Dec 26–Jan 15 is the install moment of the year — listing and content live by early December), gift-guide newsletter counter-programming ("what to do with the cards you got").
- **Review prompt moment:** after a spend entry that follows a register-screen view (the it-scanned moment).
- **Pro candidates & anchor:** household export/share, merchant totals view; one-time $2.99. Card count unlimited free forever.
- **Web/SEO queries:** "app to track gift card balances", "where to keep gift cards on phone", "gift card expiration rules", "how much money in unused gift cards".

## 7. Risks

- Barcode acceptance at real registers is the make-or-break — hence the physical scanner
  test matrix and the three-tab fallback design; if rendered codes underperform, the photo
  tab is the honest primary.
- Bearer-instrument sensitivity — the waiver's compensating controls (§2) are release-gated;
  the backup warning appears at every export, not once.
- Scope creep toward loyalty cards/coupons would dissolve the two-screen clarity — charter
  line: gift value only.
