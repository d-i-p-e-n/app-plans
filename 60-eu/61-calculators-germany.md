# Calculators — Germany (`calculators-de`) — Plan

Read [00-eu-overview.md](00-eu-overview.md) first — the regulatory framework (GDPR posture,
Impressum, StBerG/RDG wording discipline, EAA/CRA notes) and the German-first language
commitment all bind here. Where a section is silent, the corresponding US plan applies.
German tax years are calendar years; the update season is December/January (BMF publishes
the next year's Programmablaufplan in late autumn). All values indicative — verify against
current BMF/gesetze-im-internet sources at build time.

**Lineup (build order): Brutto-Netto → ETF-Steuer → Elterngeld**, then wave-2 (§5).
**Everything user-facing ships in German**; English is a secondary localization.

---

## 1. Brutto-Netto (flagship) — US sibling: [Paycheck What-If](../20-calculators/22-paycheck-whatif.md)

**One sentence:** Brutto zu Netto, ehrlich — every tax and social contribution shown line by
line, tax-class comparisons for couples, offline and ad-free.

- **Why flagship:** "Brutto Netto Rechner" is one of Germany's highest-volume finance
  queries, served entirely by ad-farms and payroll-provider lead-gen. The differentiator is
  the same as Paycheck's: show every line, work offline, sell nothing — plus the two German
  decisions generic tools handle badly: **Steuerklassen** choice for couples and the church
  tax/health-insurance variables.
- **The oracle gift:** the BMF publishes the **Programmablaufplan für den Lohnsteuerabzug** —
  the wage-tax algorithm as an official specification, updated annually. Encode it exactly;
  test against its published test cases. No other country hands us this; the plan's
  correctness claim ("matches the official algorithm") is both engineering truth and the
  credibility line in a skeptical market.
- **Engine (`engine-bruttonetto`):**
  - Income tax via the §32a EStG progression formula + Programmablaufplan wage-tax
    withholding; Steuerklassen I–VI including the **III/V vs IV/IV-Faktor couple
    comparison** (a hero feature — the yearly couple decision, currently answered by
    lead-gen); Soli remnant above its threshold; **church tax** (8/9% by Land, opt-out
    modeled as the toggle it is).
  - Social contributions, each with employer/employee split and its
    **Beitragsbemessungsgrenze**: pension (18.6%), unemployment (2.6%), statutory health
    (14.6% + fund-specific Zusatzbeitrag — user-entered with a typical default), long-term
    care (with the childless surcharge and the per-child discounts introduced 2023 — a
    correctness detail most free calculators still get wrong; golden-test it).
  - Private health insurance path: premium entered as a number (no PKV/GKV *advice* —
    §3.5 wall), employer contribution computed.
  - Sachbezüge/company car (1%-Regelung) Phase 2; **Midijob sliding zone**
    (Übergangsbereich) Phase 2 with its own published formula; Minijob shown as the flat
    special case.
  - Scenario compare (family standard): raise, class switch, church exit, 13th-salary
    months.
- **Oracles:** Programmablaufplan official test cases (primary), BMF interactive calculator
  cross-checks documented in `docs/oracles/`. Goldens ≥100: every Steuerklasse, BBG
  straddles, care-insurance child tiers, church-tax Länder, Soli threshold, Faktor
  procedure.
- **Compliance:** "Keine Steuerberatung" disclaimer set (overview §3.5); Impressum
  requirement solved before release (overview §3.1).
- **ASO & adoption (German-language listing):**
  - iOS name: `Brutto-Netto: Ehrlich` · subtitle: `Jede Abgabe, offline, werbefrei`
  - Keyword field: `gehalt,netto,lohn,rechner,steuer,steuerklasse,abgaben,brutto netto,lohnsteuer,kirchensteuer`
  - Play title: `Brutto-Netto Rechner: Ehrlich` · short: `Brutto zu Netto mit jeder Zeile
    erklärt. Steuerklassen-Vergleich. Offline, werbefrei.`
  - Long-description opener (German): "Was bleibt vom Brutto wirklich übrig? Jede Steuer und
    jede Sozialabgabe einzeln erklärt, Steuerklassen im Vergleich, nach dem offiziellen
    Programmablaufplan gerechnet — offline, ohne Werbung, ohne Datensammelei."
  - Channels: r/Finanzen (the channel — read its strict rules; the
    matches-the-official-algorithm claim is its language), Finanztip-adjacent audiences,
    German job-switch content (Gehaltsverhandlung season).
  - Review moment: compare view with a second scenario. Pro: >3 scenarios, Midijob/company-
    car modules, PDF; €5.99.

## 2. ETF-Steuer — US sibling: [Headroom](../20-calculators/26-headroom.md) (loosely)

**One sentence:** Vorabpauschale, Teilfreistellung, and your Freistellungsauftrag — German
fund taxation finally shown, including how to split the €1,000 across brokers.

- **Why:** the 2018 Investmentsteuerreform made fund taxation deterministic but opaque;
  "Vorabpauschale" spikes every January when brokers debit it and r/Finanzen fills with
  confusion. The **Freistellungsauftrag allocation** question (splitting the €1,000
  Sparer-Pauschbetrag across brokers) is universal and unserved by anything quiet.
- **Engine (`engine-etfsteuer`):** Vorabpauschale mechanics (Basiszins published annually by
  BMF, fund value at year start, distributions offset), **Teilfreistellung** rates by fund
  type (30% equity, 15% mixed, 60/80% real estate), Abgeltungsteuer 25% + Soli + church on
  top, Sparer-Pauschbetrag application, and the allocation optimizer rendered factually:
  given expected distributions/Vorabpauschale per broker, show the tax outcome of an entered
  allocation and the arithmetic-optimal split — **presented as arithmetic on published
  rules, never as a recommendation** (§3.5 audit; this app sits closest to the
  Anlageberatung line and the copy audit is strictest here). Sale-gain preview (FIFO
  lot-order note) Phase 2.
- **Oracles:** BMF Basiszins publications, worked examples from the statute's official
  explainers, hand-derived multi-broker cases. Goldens: January-1 fund-value edges, negative
  Basiszins years (Vorabpauschale = 0 — must render plainly), Teilfreistellung types,
  Pauschbetrag exhaustion ordering.
- **ASO:** iOS `ETF-Steuer: Vorabpauschale` · subtitle `Teilfreistellung & Freibetrag` ·
  keywords: `etf,steuer,vorabpauschale,freistellungsauftrag,abgeltungsteuer,depot,fonds,
  rechner,sparerpauschbetrag` · Play short: `Vorabpauschale, Teilfreistellung &
  Freistellungsauftrag — endlich verständlich.` Channels: r/Finanzen (January
  Vorabpauschale wave is the moment — listing live by December), German FIRE communities.
  Review: second scenario compare. Pro: >2 brokers, sale-gain module; €5.99.

## 3. Elterngeld — no US sibling (Germany-specific)

**One sentence:** Plan the 14 months — Basiselterngeld, Elterngeld Plus, and the partner
months laid out visually, with the income math done by the published rules.

- **Why:** every German family faces this once per child; the rules (65–67% of prior net,
  €300–€1,800 bounds, Plus vs Basis stretching, partner months, Partnerschaftsbonus,
  Mutterschaftsgeld offsets, the eligibility income cap) are deterministic but interact, the
  official calculator's planning UX is weak, and a paid consulting industry
  ("Elterngeldberatung") exists purely because of that gap.
- **Engine (`engine-elterngeld`):** relevant-income determination (12-month pre-birth net
  per the Elterngeld net-computation rules — its own simplified net formula, not the payslip
  net; encode per the statute's computation ordinance), benefit rate bands (the 65/67%
  sliding zone for lower incomes), min/max bounds, multiples/sibling bonuses,
  **Basis vs Plus stretching arithmetic**, partner-month rules and the Partnerschaftsbonus
  conditions, Mutterschaftsgeld crediting, part-time-income during receipt (the Plus
  use-case), eligibility income cap (recently lowered — verify current figure).
  The hero surface is the **month planner**: a drag layout of both partners' months
  (Basis/Plus/Bonus blocks) with the total € outcome live — the visual the consultants
  charge for, as arithmetic.
- **Compliance:** benefit rules are law — "keine Rechtsberatung" set (overview §3.5); the
  planner shows outcomes of layouts, never recommends one; official
  familienportal/Elterngeldstelle links everywhere ("die Elterngeldstelle entscheidet").
  Claiming-Age-grade copy audit in German.
- **Oracles:** official worked examples (BMFSFJ explainers), hand-derived stretching cases.
  Goldens: sliding-zone boundaries, cap ±1€, Mutterschaftsgeld overlap months, Plus with
  part-time income, bonus-condition failures.
- **ASO:** iOS `Elterngeld Planer` · subtitle `Monate legen, Betrag sehen` · keywords:
  `elterngeld,rechner,elternzeit,basiselterngeld,plus,partnermonate,elterngeldstelle,baby,
  familie` · Play short: `Elterngeld planen: Monate legen, Basis vs. Plus vergleichen,
  Betrag sofort sehen.` Channels: German parenting communities (r/Eltern), midwife/
  birth-prep course channels (the analog of First Years' pediatrician channel),
  familien-newsletter reviewers. Review: after a completed two-partner plan is saved;
  excluded near any eligibility-cap red state. Pro: twins/sibling scenarios, PDF plan
  export for the Elterngeldstelle appointment; €5.99. Cross-promo note: First Years'
  eventual German localization pairs naturally.

## 4. Repo notes

`calculators-de` mirrors the family layout; i18n scaffolding from day one (German primary,
English secondary — overview §1). `tax-data` structure: `y2026/lohnsteuer.ts`
(Programmablaufplan constants + formula version tag), `y2026/sozialversicherung.ts` (rates,
BBGs, care-insurance child tiers, Zusatzbeitrag default), `y2026/kirchensteuer.ts` (Länder
table), `y2026/invest.ts` (Basiszins, Teilfreistellung, Pauschbetrag),
`y2026/elterngeld.ts`. Annual runbook keyed to the autumn Programmablaufplan release and
January 1 social-insurance figures. German-language copy audit is a distinct release gate
(§3.5 categories: Steuer-/Rechts-/Anlageberatung) with findings in `docs/copy-audit-de.md`.

## 5. Wave 2 (brief)

- **Snowball DE** — port with German debt-landscape framing (Dispo/overdraft rates as the
  headline enemy); tone audit re-run in German; debt-counseling referral norm is the
  nonprofit Schuldnerberatung — link it, never a consolidator (the UK StepChange rule).
- **Renten-Lücke viewer** — deliberately **not** planned as a full app yet: pension-gap
  math requires assumptions the advice wall can't comfortably carry in Germany's regulatory
  climate; revisit with the same caution as Next Dollar. A `quiet-site` explainer pointing
  at the official Renteninformation serves the query honestly meanwhile.
- **Rent or Buy DE** — Kaufen vs. Mieten is a huge German debate; deltas: Grunderwerbsteuer
  by Land, notary/agent costs, no owner-occupier interest deduction, Germany's
  renter-friendly baseline. Deferred until the flagship proves the market.
