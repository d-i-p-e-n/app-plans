# HSA/FSA Vault — Plan

**One sentence:** A private vault for medical receipts plus the deadline alarms that stop FSA
money from evaporating.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. Third app in the family; first user of
PDF export.

> **Policy revision (2026-07):** per shared standards §1.2/§9, this app now includes Firebase
> Analytics + Crashlytics and AdMob banners with the Remove-Ads IAP and full consent stack —
> the "no third-party SDKs at all" line in this document's risks section is superseded;
> regenerate privacy/store copy at implementation (§9.5 sweep). §9.3's content wall applies at
> medical strictness: no provider, amount, or category data in events. Placement per §9.1:
> receipt capture and the PDF-packet flow are ad-free; banners live on the accounts list and
> settings.

## 1. Product

- **Audience:** the tens of millions of US workers with an HSA or FSA. Two very different jobs,
  one vault:
  - **FSA people:** use-it-or-lose-it panic — deadline alarms + "how much is left" tracking.
  - **HSA people:** the shoebox problem — save receipts for years (decades, for the
    reimburse-later strategy) with proof that survives phone upgrades.
- **Gap:** administrator apps (WEX/HealthEquity-class) are terrible, tied to one employer plan,
  and lost on job change. People use camera rolls and folders. Nothing owns the neutral,
  plan-agnostic vault.

Non-goals: eligibility adjudication ("is this expense eligible?" — a bundled reference list of
common categories with IRS Pub 502 citation, clearly marked informational; never a coverage
promise), claims submission/integration with administrators (never), insurance anything, HSA
investment tracking (it's a receipts app, not a brokerage).

## 2. Domain (`packages/domain-hsa`)

Data model (sqlite):
- `accounts`: id, kind (`HSA | FSA | LPFSA | DCFSA`), label ("2026 FSA — Cigna"), plan_year_start,
  plan_year_end, grace_period_end?, carryover_cents?, election_cents?, notes. Multiple accounts
  (job changes, spouse plans, per-year FSAs).
- `receipts`: id, account_id?, date_of_service, provider, patient_label (free text — "me",
  "Jayden"; a label, not identity data), amount_cents, category (from the eligible-category
  reference), photo_ids[], status (`unreimbursed | reimbursed | pending`), reimbursed_at?,
  notes. `account_id` nullable: HSA-strategy receipts can be vault-only ("bank of receipts").
- `eligible_categories` (bundled reference): name, Pub 502 anchor, notes ("OTC meds eligible
  since CARES Act") — data with citations, annual review runbook.

Logic (pure, tested):
- **FSA countdown math:** remaining = election − sum(receipts marked against plan year);
  deadline chain = plan_year_end → grace_period_end → runout note; per-account countdown states.
- **HSA running totals:** unreimbursed pool total ("you can reimburse yourself $4,312 today,
  tax-free — keep these receipts"), per-year and per-patient-label breakdowns.
- **Notifications:** FSA only, per account: 60/30/7 days before the later of plan_year_end/
  grace_period_end, with remaining balance in the copy ("$418 left in your FSA — 30 days to
  spend it"). Nothing for HSA (no deadlines — the honesty is on-brand). Deterministic IDs
  `{account}:{deadline}:{d60|d30|d7}`.

## 3. Capture & export

- Capture flow: same <20 s bar as Return Window — camera first, then one screen (date, provider
  type-ahead over past entries, amount, patient chip, category chip, account chip).
- **PDF export (the HSA killer feature):** select receipts (filter by year/status/account) →
  generate a reimbursement packet via `expo-print`: cover summary table (date, provider,
  patient, amount, total) + one page per receipt photo, captioned. Share sheet → email to self /
  save to Files. Also CSV of the table. Round-trip zip backup per family standard, separately.
- Mark-reimbursed flow updates status in bulk from the same selection UI.

## 4. Screens

- `/` **Accounts:** card per account: kind badge, remaining/pool amount, deadline countdown
  (FSA) or unreimbursed total (HSA). Global "vault total" line.
- `/add` — capture flow.
- `/receipts`: filterable list (year, account, status, patient, category); batch-select →
  export packet / mark reimbursed.
- `/receipt/[id]`: detail, photos full-screen zoomable, edit, status.
- `/eligible`: the reference list, searchable, Pub 502 citations, "informational only" header.
- `/settings`: family privacy page (extra emphasis: medical-adjacent data, on-device only, no
  analytics — and in Health-data privacy questionnaire terms, we collect nothing), export/import,
  deadline notification preferences.

## 5. Phases & acceptance criteria

1. **Domain:** account/deadline/pool math incl. grace-period chains, mid-year account creation,
   multi-account totals; category reference dataset with citations.
2. **Capture + vault:** add flow <20 s; receipts list with filters; detail; photo store reuse.
3. **Export:** PDF packet generation with 50-receipt fixture (pagination, file size sane —
   downscale in packet to keep <25 MB email-able); CSV; zip backup round-trip.
4. **Notifications E2E:** FSA countdown chain on device, app killed; copy includes live
   remaining balance at schedule time with reconcile-on-open refresh.
5. **Release:** EAS, listing; App Store health-privacy questionnaire answered carefully
   (no data collected/transmitted; document reasoning in `docs/store-privacy-notes.md`).

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** HSA FSA Vault
- **iOS subtitle:** Receipts & deadline alarms
- **iOS keyword field:** medical,receipts,reimbursement,deadline,health,savings,shoebox,expenses,taxes,claim,flex
- **Play title:** HSA FSA Vault: Receipts
- **Play short description:** Save every medical receipt. Never lose FSA money to a deadline again.
- **Keyword targets:** primary "HSA receipts", "FSA deadline"; long-tail "HSA shoebox strategy app", "FSA use it or lose it reminder".
- **Play long description — first two lines:** "FSA money evaporates on a deadline; HSA reimbursements need receipts you'll want years from now. One private vault handles both: countdown alarms with your remaining balance, a running total you can reimburse tax-free any time, and a one-tap PDF packet when you file."
- **Screenshot story:** FSA countdown card with balance → 15-second receipt capture → HSA unreimbursed pool ("$4,312 you can claim any time") → PDF packet.
- **Launch channels:** r/personalfinance, r/financialindependence (the HSA-shoebox strategy is a known FIRE tactic — highest-intent audience), r/HealthInsurance, open-enrollment-season SEO content (Oct–Dec), HR/benefits newsletters.
- **Review prompt moment:** after the first PDF reimbursement packet export.
- **Pro candidates & anchor:** >3 accounts, packet variants, CSV; one-time $5.99.
- **Web/SEO queries:** "HSA receipt shoebox app", "FSA deadline reminder use it or lose it", "how long to keep HSA receipts", "HSA reimburse yourself later strategy".

## 7. Risks

- Anything smelling like eligibility or tax advice — the reference list is informational with
  citations, period; copy review at release.
- Medical-adjacent privacy expectations are the highest in the portfolio: no third-party SDKs at
  all in this app (not even opt-in crash reporting), and say so.
- Long-horizon data (HSA strategy = decades): the export/backup story must be prominent in
  onboarding, not buried — losing a decade of receipts to a lost phone is the catastrophic
  failure mode; nudge a backup after every 25 new receipts (gentle, in-app only, never push).
