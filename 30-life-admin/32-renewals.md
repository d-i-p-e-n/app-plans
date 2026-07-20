# Renewals — Plan

**One sentence:** Every subscription and free trial you have, warned before it renews — and it
never asks for your bank login.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. **Build this app first in the family and
first in the whole portfolio** — smallest surface, proves `local-core`, fastest to ship.

## 1. Product

- **Audience:** everyone with 8+ subscriptions and a vague dread about them. Specifically the
  large, loud population that refuses to give Rocket Money/Plaid their bank credentials — the
  resentment is searchable and the pitch is one sentence: *"We can't see your bank account."*
- **Core jobs:** (1) "Warn me before anything renews, especially annuals." (2) "Warn me before
  this free trial converts." (3) "What am I actually spending per month, all-in?" (4) "When I
  cancel something, remember that I did."
- Manual entry of ~15 subscriptions takes five minutes and is the **moat, not the weakness** —
  onboarding says exactly that.

Non-goals: bank/Plaid/email import (never — it's the identity), cancellation-as-a-service
(deep-link to the service's cancel page when known; we never act on the user's behalf), bill
negotiation, shared/family sync (Phase 6 via export/import or share codes; no accounts).

## 2. Domain (`packages/domain-renewals`)

Data model (sqlite):
- `subscriptions`: id, name, icon_key (bundled icon pack of ~100 common services + monogram
  fallback — bundled, never fetched), amount_cents, currency, cadence (`weekly | monthly |
  quarterly | semiannual | annual | custom_days`), next_renewal_date, is_trial (bool),
  trial_converts_to_cents?, payment_label? (free text like "Amex …1005" — a label, never a
  card number: validate against ≥8 consecutive digits and refuse), category, notes, status
  (`active | canceled | paused`), canceled_at?
- `events`: id, subscription_id, kind (`renewed | price_changed | canceled | resumed`), at,
  amount_cents? — the price-history ledger ("Netflix: $11.99 → 13.49 → 15.49" is powerful,
  user-entered).

Logic (pure, tested):
- **Next-renewal advancement:** on app open, roll past-due next_renewal_date forward by cadence
  (logging a `renewed` event), month-end aware (Jan 31 monthly → Feb 28/29 → Mar 31, i.e.
  anchor-day semantics; tested hard).
- **Totals:** true monthly/annual all-in (annuals amortized), per-category, "renewing in the
  next 30 days: $X" — multi-currency displayed per-currency (no FX conversion in MVP; sum per
  currency honestly).
- **Notification decisions:** trials: 2 days before conversion + morning-of ("converts to
  $15.49/mo today unless canceled"). Annuals/semiannuals: 7 days before. Monthlies: off by
  default (spam), single monthly digest option OFF by default ("your next 30 days: $142 across
  9 renewals") — the one digest in the whole portfolio, and it's opt-in.
- Deterministic IDs `{sub_id}:{renewal_date}:{d7|d2|d0}`.

## 3. Screens

- `/(onboarding)`: the moat speech (one screen: "No bank linking. Ever. Five minutes of typing
  buys you years of warnings.") → rapid-add (search bundled service list, amount, cadence,
  next date — repeat) → notification defaults.
- `/` **Upcoming:** chronological renewals (next 60 days), amount + days-left pill; trials
  pinned top with conversion warnings. Header: this month's total. Empty state: "Nothing renews
  soon. As it should be."
- `/all`: by category/amount; canceled graveyard at bottom (with "total saved since canceling:
  $X/yr" — the single feel-good number, computed from canceled subs' cadence).
- `/sub/[id]`: detail — edit, price-history ledger with "log price change" (creates event),
  cancel flow: "mark canceled" + deep link to the service's cancel URL when known (bundled
  best-effort URL list, ~40 services, quarterly runbook like Return Window's policies).
- `/settings`: family privacy page, export/import, digest toggle (off), currency note.

## 4. Phases & acceptance criteria

1. **local-core bootstrap** (this app builds it): sqlite migrations runner, notification
   scheduler with reconcile-on-open, export/import zip round-trip — all tested here, reused by
   three siblings.
2. **Domain:** advancement/anchor-day/totals/decision logic; goldens for date math (leap years,
   month-end anchors, custom cadences, timezone-change days).
3. **App:** onboarding rapid-add (measure: 10 subs in <4 min), Upcoming, All, detail, cancel
   flow, ledger.
4. **Notifications E2E:** trial d2/d0 and annual d7 on physical devices with app killed; digest
   opt-in path; reconcile after Android reboot.
5. **Release:** EAS, listing, privacy "no data collected."

## 5. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle. No competitor names in
store metadata (playbook §1) — the "Rocket Money alternative" phrasing lives on the web page only.

- **iOS name:** Renewals: Subscriptions
- **iOS subtitle:** No bank linking. Ever.
- **iOS keyword field:** subscription,tracker,free trial,cancel,reminder,budget,bills,recurring,manager,money,spend
- **Play title:** Renewals: Subscriptions
- **Play short description:** Track subscriptions & trials without linking your bank. Private & offline.
- **Keyword targets:** primary "subscription tracker", "free trial reminder"; long-tail "subscription tracker without bank account", "cancel subscription reminder".
- **Play long description — first two lines:** "Every subscription tracker wants your bank login. Renewals doesn't — type in your subscriptions once (five minutes, honestly) and get warned before every renewal and free-trial conversion, forever. We can't see your accounts, and that's the point."
- **Screenshot story:** "No bank linking. Ever." → Upcoming with a trial warning → price-history ledger → total-saved graveyard.
- **Launch channels:** Show HN (top portfolio fit: local-first architecture + anti-Plaid stance), r/privacy, r/Frugal, privacy newsletters; be genuinely helpful in bank-linking complaint threads with disclosure.
- **Review prompt moment:** after marking a subscription canceled (savings moment).
- **Pro candidates & anchor:** unlimited subscriptions (free cap ~30), household export, CSV; one-time $4.99.
- **Web/SEO queries:** "subscription tracker without bank account", "rocket money alternative no plaid", "free trial reminder app", "private subscription manager offline".

## 6. Risks

- Manual upkeep decay (users forget to log changes) — the advancement logic keeps dates right
  automatically; price changes are the only thing needing user input, and the ledger UI makes
  that a 2-tap act from the renewal row.
- The digest is a slippery slope — it stays opt-in-off forever; any future notification type
  must be argued against this plan in writing (STATUS.md).
- Payment-label field must never become a card-number field — the ≥8-digit refusal is an
  acceptance-tested behavior, not a suggestion.
