# In Case — Plan

**One sentence:** Everything your family would need if something happened to you — where
things are, who to call, what you'd want — organized privately and exportable as a sealed
packet for the person you trust.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. **Promoted from the backlog** —
the Health Binder overlap is resolved here (§2): Health Binder keeps everything medical
(including the advance-directive location pointer); In Case is *household continuity* and
links to it.

## 1. Product

- **Audience:** adults with dependents; anyone whose household would be lost without them
  ("only I know where anything is"); adult children nudging parents to organize (the
  caregiver channel a third time — Big Buttons, Health Binder, and this app form a natural
  trio). "Death binder" / "in case of emergency binder" is a large, persistent content
  genre with no good private tool.
- **Gap:** the incumbents (Everplans-class) are subscription cloud services asking you to
  upload your most sensitive information to their servers — and the users who most want
  this organized are the ones least willing to do that. The actual incumbent is a Word doc,
  a drawer, or nothing.
- **Core loop:** fill sections at your own pace (completeness meter, no guilt) → export the
  sealed packet → tell your person where it is → one review nudge a year.

Non-goals — **the legal wall, absolute:** this app organizes information; it does not
create legal documents. No will/trust templates, no beneficiary-designation advice, no
"do I need a trust" content (unauthorized-practice-of-law adjacency; the app says plainly:
"a will requires proper legal execution — this binder tells your family where yours *is*").
No document *storage* of legal instruments (location pointers, not scans — a scan of a will
is not a will, and implying otherwise is harm). No password storage, ever (§2).

## 2. Domain (`packages/domain-incase`)

Sections (sqlite; every field is a label/pointer — the Renewals ≥8-consecutive-digits
refusal applies throughout):

- **Documents & where they are:** will/trust (location + attorney label), deeds, titles,
  insurance policies (carrier, type, agent phone, "policy docs: blue file"), birth/marriage
  certificates, tax records. Pointer records only.
- **Accounts inventory:** institution, account *type*, rough purpose ("checking — bills
  autopay"), how to identify it — never numbers, never credentials. A completeness prompt
  covers the commonly forgotten ones (HSA, old 401(k)s, crypto exchanges, domain names).
- **Digital life:** password-manager *pointer* ("Bitwarden — emergency access configured
  for Sam") plus checklist items to actually configure the manager's emergency-access
  feature and the phone's legacy-contact settings (Apple/Google) — we point at the right
  tools for secrets and store none ourselves.
- **People to call:** executor label, attorney, accountant, financial institutions, employer
  HR/benefits line (life insurance through work is the classic missed asset).
- **Household operations:** utilities/autopays list, where the shutoffs are, service
  providers, rent/mortgage particulars (labels).
- **Dependents & pets:** care instructions, school/daycare contacts, Pet Papers/First Years
  cross-pointers.
- **Wishes:** free text (memorial preferences, messages) — presented last, entirely
  optional, never nagged.
- **Medical:** one line: "See {name}'s Health Binder — export its ER sheet too." (The
  overlap resolution: nothing medical lives here.)

Completeness model: per-section done/partial/empty; the meter celebrates progress and never
shames ("6 of 9 sections started" — no red states).

## 3. The Sealed Packet (the product)

- Export = a single **passphrase-encrypted archive** (AES-256 via a vetted, widely-audited
  library — implementation note for the agent: no hand-rolled crypto, document the library
  choice and parameters in `docs/`) containing a formatted PDF of all sections + the data
  JSON.
- Alongside it: a **plaintext cover sheet** PDF — "This is {name}'s In Case packet, made
  {date}. To open it you need the passphrase, which {trusted person} has / is stored
  {where}. Open it if…" — the deliberately unencrypted instruction layer.
- The passphrase is chosen by the user and never stored by the app (stated loudly; losing
  it means re-exporting — acceptable, and explained in plain words at export time).
- Delivery is the user's choice (email to the trusted person, family safe, their own cloud
  drive) — the Contents off-site rule applies: we insist the packet leaves the phone, and
  we never provide the destination.
- Annual review: one push a year ("a lot changes in a year — 15 minutes keeps the packet
  true") plus a changed-sections diff since the last seal.

## 4. Screens

- `/(onboarding)`: the framing ("Not morbid. Kind. An hour now saves your family weeks of
  detective work.") → pick a starting section (accounts recommended) → first entries.
- `/` **Binder:** section cards with completeness states + the forgotten-items prompts;
  packet status card ("last sealed: March — 3 sections changed since").
- `/section/[key]`: entries + section-specific prompts; label-entry forms (<20 s per entry,
  family standard).
- `/packet`: preview → passphrase → export + cover sheet; delivery checklist.
- `/settings`: family privacy page (strictest tier — zero third-party SDKs, HSA-Vault
  precedent), export/import (unencrypted local backup, clearly distinguished from the
  sealed packet), review-nudge toggle, the legal-wall statement.

## 5. Phases & acceptance criteria

1. **Domain + sections:** schema, prompt datasets, completeness logic; number-refusal
   validation tested.
2. **Sealed packet:** encryption round-trip tests (seal → decrypt → byte-identical; wrong
   passphrase fails cleanly); **decryption verified on a second physical device** (the
   packet must open at the moment of need — acceptance criterion, not polish); cover
   sheet; 30-entry fixture packet <5 s.
3. **App:** binder, section flows, packet flow, diff-since-last-seal.
4. **Notifications + audit:** annual nudge E2E; full copy audit against the legal wall and
   tone rule (kind, never morbid, no fear statistics — Claiming Age rigor).
5. **Release:** EAS, listing (§6), "no data collected."

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits
at submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** In Case: Family Binder
- **iOS subtitle:** If something happens to you
- **iOS keyword field:** emergency,binder,estate,documents,organizer,legacy,planning,checklist,executor,will
- **Play title:** In Case: Family Binder
- **Play short description:** Where everything is, who to call, what you'd want — organized, private.
- **Keyword targets:** primary "in case of emergency binder", "death binder"; long-tail "what does my family need to know if I die", "estate organizer app private".
- **Play long description — first two lines:** "If something happened to you tomorrow, could your family find the will, the accounts, the insurance, the person to call? In Case organizes all of it on your phone — no cloud service holding your life's index — and seals it into an encrypted packet for the one person you trust."
- **Screenshot story:** section cards with completeness meter → the forgotten-items prompt ("old 401(k)s?") → the sealed packet + cover sheet pair → "no cloud service holds this" stance shot.
- **Launch channels:** r/AgingParents (nudging parents is the strongest angle), r/personalfinance's recurring death-binder threads, estate-attorney-adjacent newsletters (the no-legal-documents wall makes us complementary to attorneys, not competitive — they want organized clients), caregiver communities alongside Health Binder.
- **Review prompt moment:** after the first sealed packet export (relief moment). Excluded: any session that begins from the open-packet/cover-sheet path (that user may be grieving).
- **Pro candidates & anchor:** multiple binders (both partners), packet variants (executor vs babysitter subsets), section template packs; one-time $5.99.
- **Web/SEO queries:** "in case of death binder checklist", "what information does my family need if I die", "everplans alternative private one time", "emergency binder template app". The section checklist doubles as the SEO page.

## 7. Risks

- Tone is everything — one morbid or fear-marketing string kills it; the copy audit is a
  hard gate and no "63% of families…" statistics appear anywhere.
- Crypto care: vetted library, tested round-trips, honest passphrase-loss behavior; the
  second-device decryption test is the guard against the catastrophic failure (a packet
  that won't open when needed).
- Staleness silently misleads — the annual nudge and the "made {date}" stamp on every
  packet page are mandatory.
