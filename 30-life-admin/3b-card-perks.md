# Card Perks — Plan

**One sentence:** Every credit card's annual fee, renewal date, and expiring credits in one
private tracker — keep the perks you paid for, decide renewals with real numbers, never link
a bank.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first.

## 1. Product

- **Audience:** two tiers — the optimizer community (r/churning, r/CreditCards: loud,
  spreadsheet-native, evangelical about tools that respect them) and the far larger casual
  tier: anyone with one or two annual-fee cards quietly forgetting the $200 airline credit and
  the $240 streaming credits they're paying for.
- **Gap:** incumbents either demand account linking (MaxRewards-class) or run subscriptions
  with cloud sync (CardPointers-class). The optimizer community's actual tool is a spreadsheet.
  Private, manual, one-time-purchase, quiet — unserved, and this audience specifically
  *values* the no-linking stance.
- **Core loop:** add cards once → check off credits as you use them → one batched reminder
  before credits expire and before each annual fee → at renewal, see "you used $340 of this
  $395 fee" and decide with eyes open.

Relationship to Renewals: Renewals tracks the *cost* side of any subscription; Card Perks
tracks the *value* side of credit cards specifically (credits, benefits, fee-vs-value math).
Users with both get a settings cross-mention, nothing more — no data coupling.

Non-goals: points/miles balance tracking (requires linking — never), spend tracking or
category-bonus optimization (requires transactions — never), card recommendations or affiliate
links (**the category's defining conflict of interest; its absence is our entire credibility**
— every card blog is an affiliate farm), credit-score anything, application/churn velocity
tracking (5/24-style rules change; Phase 6 only as a user-maintained log, never advice).

## 2. Domain (`packages/domain-cardperks`)

Data model (sqlite):
- `cards`: id, nickname ("my Platinum"), template_key?, issuer label, network label,
  af_cents, af_anniversary (month/year), opened?, closed_at? (closed cards keep history),
  retention_notes (free text — offer history, the community's ritual), **no card numbers: the
  Renewals ≥8-consecutive-digits refusal applies; nickname + last-4-as-label max.**
- `benefits`: card_id, name, value_cents, cadence (`monthly | quarterly | semiannual | annual |
  per_cardmember_year`), reset_rule (`calendar | anniversary`), auto flag (e.g., lounge access
  — counts toward value if marked used at all), notes.
- `benefit_usage`: benefit_id, period_key, used_at, value_used_cents (partial use allowed —
  $137 of a $200 credit).
- `card_templates` (bundled dataset — the accelerant, not the source of truth): the ~40 most
  common US annual-fee cards with their published credits/benefits pre-filled (name, value,
  cadence, reset rule). Every template stamped "as of {date} — issuers change benefits; verify
  yours" and fully editable after import. Quarterly review runbook (issuer benefit churn is
  constant); dataset entries carry source notes in `docs/`. Nominative use of card names inside
  the app is fine; **no issuer trademarks in store metadata** (playbook §1).

Logic (pure, golden-tested):
- **Period math:** calendar vs cardmember-year resets, monthly/quarterly boundaries, partial
  months at open/close, the December-31 vs anniversary distinction (the classic double-dip
  window the community cares about — model it factually).
- **Fee-vs-value:** per card per cardmember year: sum(value_used) vs af_cents → the renewal
  verdict aid ("used $340 of $395") — factual framing only, never "cancel this card."
- **Notification decisions:** unused credit expiring in 7 days (batched: "3 credits expire
  this month: dining $10, streaming $20, Uber $15"); monthly-reset digest on the 1st (opt-in,
  the Renewals-digest pattern — off by default); AF anniversary − 30 days with the fee-vs-value
  number in the copy ("Platinum renews Aug 12: $695 fee, you've used $412 this year").
  Deterministic IDs `{benefit}:{period}` / `{card}:{anniversary}`.

## 3. Screens

- `/(onboarding)`: the stance ("No bank linking. No affiliate links. We don't care which cards
  you have — we care that you use what you pay for.") → add first card (template search or
  custom) → toggle the benefits you actually use → done.
- `/` **This Month:** expiring-soon credits with one-tap "used it" (partial-amount sheet on
  long-press), then upcoming AF anniversaries with their running fee-vs-value bars. Empty
  state: "Everything's used or not due. As it should be."
- `/cards` + `/card/[id]`: portfolio list (total AF/yr, total value used YTD — the two numbers
  that matter); card detail: benefits with per-period usage grids, fee-vs-value bar, AF
  history, retention notes.
- `/add`: template picker (search) → editable import → custom-benefit builder.
- `/year`: annual review — per card and total: fees paid vs value used, the "kept vs left on
  the table" summary (the shareable screenshot for the community).
- `/settings`: family privacy page, template-dataset version + "verify your terms" note,
  digest toggle (off), export/import zip, CSV export seam, Renewals cross-mention.

## 4. Phases & acceptance criteria

1. **Domain:** period-reset engine goldens (calendar vs anniversary, quarterly boundaries,
   double-dip windows, mid-year open/close, partial usage), fee-vs-value math, notification
   decisions.
2. **Template dataset:** ~40 cards encoded with source notes + "as of" stamps; import→edit
   flow; dataset schema tests; quarterly runbook committed.
3. **App:** onboarding <2 min for a 3-card user (measured); This Month with one-tap usage;
   card detail; year review.
4. **Notifications E2E:** expiring-credit batch and AF-30 with live numbers on killed device;
   digest opt-in path; reboot reconcile.
5. **Release:** EAS, listing (§5), "no data collected"; metadata trademark sweep (no issuer
   names anywhere in store fields).

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle. **No issuer or card-brand
trademarks in any store metadata field.**

- **iOS name:** Card Perks: Fee & Credits
- **iOS subtitle:** Use every credit. No linking
- **iOS keyword field:** credit card,annual fee,benefits,rewards,points,travel,tracker,renewal,retention,churn
- **Play title:** Card Perks: Fee & Credits
- **Play short description:** Annual fees, renewal dates & expiring credits — tracked privately. No linking.
- **Keyword targets:** primary "credit card benefits tracker", "annual fee tracker"; long-tail "track credit card credits without linking", "is my annual fee worth it".
- **Play long description — first two lines:** "You're paying an annual fee for credits you keep forgetting to use. Card Perks tracks every card's fee, renewal date, and expiring credits — one batched reminder before anything lapses, and an honest 'used $340 of $395' number when renewal comes. No bank linking, no affiliate links, ever."
- **Screenshot story:** This Month with expiring credits → one-tap "used it" → fee-vs-value bar at renewal → year review "kept vs left on the table" → "no linking, no affiliate links" stance shot.
- **Launch channels:** r/CreditCards (high fit), r/churning **only** via their sanctioned weekly/tool threads after studying the sub's strict self-promo rules, Doctor of Credit and points-community blogs (they cover indie tools; the no-affiliate stance is itself the story), points/travel podcasts and FinTok creators.
- **Review prompt moment:** after a cardmember year closes with value-used ≥ the annual fee (the "this app paid for itself" moment).
- **Pro candidates & anchor:** >3 cards, full template library (starter set free), year-review CSV/export, retention-history fields; one-time $5.99.
- **Web/SEO queries:** "credit card benefits tracker without linking account", "track amex credits app" (web page may name cards nominatively; store metadata may not), "is my credit card annual fee worth it calculator", "cardpointers alternative one time purchase".

## 6. Risks

- Benefit-dataset churn is constant (issuers tweak credits quarterly) — the "as of" stamps,
  editable-everything design, and quarterly runbook keep drift from becoming betrayal; the
  dataset accelerates entry but user edits are always the truth.
- Trademark exposure — nominative in-app use is standard, but store metadata and screenshots
  must use generic framing ("premium travel card"); pre-flight sweep is an acceptance item.
- The affiliate temptation is the category's gravity well — the no-recommendations,
  no-affiliate rule is charter-level; any future monetization idea that touches card referrals
  dies at this document.
