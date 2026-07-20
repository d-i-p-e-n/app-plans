# Life-Admin Family — Overview

One monorepo (`life-admin`), eleven apps, **no backend at all**. The family thesis: incumbents
solved these problems by demanding bank logins, email scraping, or cloud accounts, and a large
population noped out. We solve them with fast manual entry, on-device storage, local scheduled
notifications, and honest export. **"We can't see your data" is the marketing, and the
architecture must make it literally true.**

Apps: Return & Warranty Tracker, Renewals, HSA/FSA Vault, Deposit Defense, Expiry Vault,
Home Rhythm, Glovebox, Pet Papers, Health Binder, Contents, Card Perks.

## Monorepo layout

```text
apps/return-warranty/
apps/renewals/
apps/hsa-fsa-vault/
apps/deposit-defense/
apps/expiry-vault/
apps/home-rhythm/
apps/glovebox/
apps/pet-papers/
apps/health-binder/
apps/contents/
apps/card-perks/
packages/domain-<app>/        Pure logic: deadline math, notification decisions, totals
packages/local-core/          Shared: sqlite DAO helpers, notification scheduler, photo store,
                              backup/export engine
packages/ui/
packages/entitlements/
docs/
STATUS.md
```

## `packages/local-core` — build once, in the first app (Renewals)

1. **DB layer:** `expo-sqlite` + a tiny typed migration runner (numbered SQL files per app,
   applied at startup, versions table). No ORM dependency; DAOs are hand-written typed modules —
   the schemas are small.
2. **Notification scheduler:** wraps `expo-notifications`:
   - `syncSchedules(desired: DesiredNotification[])` — computes desired set from domain logic,
     diffs against OS-scheduled set, adds/removes. Deterministic IDs `{entity}:{milestone}`.
   - Reconcile-on-open: every app foreground runs syncSchedules (the safety net for Android
     reboot behavior and OS pruning — shared standards §5).
   - Respects per-app quiet defaults (deliveries default 09:00 local — deadline reminders are
     morning information, never evening anxiety).
3. **Photo store:** save to `FileSystem.documentDirectory/photos/{uuid}.jpg` with an index row in
   sqlite (entity link, captured_at, sha256). Images compressed to ~2000px longest edge (quality
   0.8) at capture via `expo-image-manipulator`; originals not kept (document this in-app).
   iCloud/Google device backup covers these files by default — that *is* the backup story, plus:
4. **Export/backup engine:** every app exports a single `.zip` (JSON data + photos) via the
   share sheet, and re-imports it (restore/migrate). Round-trip tests are mandatory. This is the
   answer to "what if I lose my phone" without us running servers.

## Family conventions

- **Entry speed is the product.** Every "add" flow must be completable in <20 seconds. Prefill
  aggressively (today's date, last-used category, sensible defaults). Number pads for amounts.
- **Badges/deadlines philosophy:** apps surface *upcoming* obligations, never guilt. No streaks,
  no red badges for things past (a lapsed return window just moves to history).
- **Privacy page** in every app: what's stored (device only), what's in exports, the no-network
  statement. These apps should function with network permission effectively unused; any asset
  (e.g., bank-logo packs) ships in the bundle.
- **OCR stance:** receipt OCR is Phase-2 everywhere, on-device only (evaluate
  `expo-mlkit-text-recognition`-class libraries at build time). Manual entry must be so fast
  that OCR is a garnish, not a dependency.
- Pro-candidate features (free at launch): unlimited items (caps generous), PDF/CSV exports,
  multiple vaults/properties.

## Build order

**Renewals first** (smallest schema, proves local-core end-to-end), then Return & Warranty
(adds photo store usage), HSA/FSA Vault (adds export-as-PDF), Deposit Defense (adds report
generation — heaviest document output). The second wave reuses everything: Expiry Vault
(reminder ladders — nearly pure reuse, build it first in the wave), Glovebox and Pet Papers
(photo store + PDF export reuse), Home Rhythm (adds the schedule-generator dataset pattern).
Third wave: Health Binder and Card Perks (pure reuse of PDF/reminder machinery, dataset-driven);
Contents must follow Deposit Defense — its phase 1 extracts that app's capture/integrity/report
engine into `local-core` for both to share.
