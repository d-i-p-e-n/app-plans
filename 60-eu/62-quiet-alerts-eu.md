# Quiet Alerts — EU (`quiet-alerts-eu`) — Plan

Read [00-eu-overview.md](00-eu-overview.md) first — §3.1's GDPR checklist (EU-region
Supabase, DPA, Art. 30 records, Art. 27 representative decision, breach runbook) is a
**blocking prerequisite** for this entire repo, and the family conventions from
[../10-quiet-alerts/00-family-overview.md](../10-quiet-alerts/00-family-overview.md) apply
throughout. Launch is **Germany-first, German-language-first** (overview §1), with the
pan-EU data sources built so additional countries are data/localization additions, not
re-architecture.

**Lineup (build order): Recall Watch EU → Quiet Weather EU → Shortage Watch DE**, then
wave-2 (§5).

## 0. Repo & backend

Own repo, own **EU-region Supabase project** (Frankfurt) — schema copied from the US family
(devices/subscriptions/events/deliveries + RPC model), separate credentials, separate
`ingest_runs` health surface. The US and EU pipelines never share data. GDPR posture
(minimal anonymous device rows, push default-off, erasure RPCs) is inherited by design;
`docs/eu-compliance.md` records the §3.1 checklist with dates and evidence. Privacy pages in
German, naming the controller and (if applicable) the Art. 27 representative.

---

## 1. Recall Watch EU — US sibling: [Recall Watch](../10-quiet-alerts/11-recall-watch.md)

**One sentence:** Rückrufe, die dich betreffen — EU Safety Gate, RASFF, and German food-
warning feeds filtered to what your household actually owns.

- **Data sources (verify endpoints/terms at build time):**

| Source | What | Notes |
|---|---|---|
| EU Safety Gate (ex-RAPEX) | Non-food consumer product alerts, EU-wide | Weekly reports with open data access; the pan-EU backbone for products (car seats, toys, electronics) |
| RASFF Window | Food/feed safety notifications, EU-wide | Public portal data; classification into consumer-relevant recalls needs the same curated keyword rules as the US app |
| lebensmittelwarnung.de | German official food/product warnings (federal/Länder) | Public feed; the German consumer-facing layer — primary for DE launch |
| KBA recall database | German vehicle recalls | Coverage is patchier than NHTSA; vehicle matching launches best-effort with honest labeling ("Hersteller-Rückrufe: Abdeckung begrenzt") — or defers to Phase 2 if quality is insufficient at build time |

- **Deltas from the US plan:** matching/category logic ports directly (normalization tables
  rebuilt for German brand/product text; golden corpus rebuilt from ~200 real Safety Gate/
  RASFF/lebensmittelwarnung records); the category safety net matters even more because EU
  product matching is multilingual (Safety Gate entries mix languages — normalize via the
  English fields where present, German otherwise, and lean on categories). VIN-style
  vehicle matching only if KBA data quality allows. Allergen subscriptions map to RASFF's
  allergen-notification reasons cleanly.
- **Audience & channels:** German parents first (same beachhead logic as the US — car seats,
  toys, formula); r/Eltern, German parenting Facebook groups, Ökotest/Stiftung-Warentest-
  adjacent audiences (recall-aware by culture — a genuinely favorable market).
- **ASO (German):** iOS `Rückruf-Radar` · subtitle `Nur was dich betrifft` · keywords:
  `rückruf,produktwarnung,lebensmittel,kindersitz,spielzeug,warnung,sicherheit,rapex,
  allergen` · Play short: `Rückrufe & Produktwarnungen — nur für Dinge, die du wirklich
  besitzt. Leise.` Review moment and Pro model as the US plan; Supporter €5.99/yr.
- **Risks:** multilingual fuzzy matching precision (bias to precision + category net, US
  rule); source fragmentation (three feeds minimum — the `ingest_runs` health discipline is
  load-bearing); Safety Gate redistribution/attribution terms re-verified at build.

## 2. Quiet Weather EU — US sibling: [Quiet Weather](../10-quiet-alerts/12-quiet-weather.md)

**One sentence:** Amtliche Warnungen, sonst Stille — official weather warnings only, from
Europe's national met services via MeteoAlarm.

- **Data source & the licensing checkpoint:** **MeteoAlarm** (EUMETNET) aggregates official
  CAP warnings from 30+ national meteorological services — the structural twin of the US
  NWS CAP feed. Its **redistribution terms are a blocking Phase-1 checkpoint** (the
  Streaming-Arrivals discipline): MeteoAlarm has specific conditions on redistribution and
  attribution per contributing NMS; secure written clarity, and record the per-country
  attribution matrix in `docs/data-sources.md`. Germany fallback if needed: DWD's own open
  data (GeoJSON warnings, generous open-data terms) covers the DE launch by itself —
  which de-risks the whole plan: **DE launch can ship on DWD alone**, MeteoAlarm extends it
  EU-wide when terms allow.
- **Deltas:** the concern-pack taxonomy ports (freeze/rain/heat/wind/winter) with CAP
  severity mapping per MeteoAlarm's awareness levels (orange/red conventions differ from US
  practice — the always-on life-safety set maps to red-level events per the rule table,
  rebuilt and golden-tested against ~100 real EU CAP fixtures); rain-soon derives from
  DWD radar-based nowcasts (DE) or Open-Meteo (terms caveat unchanged); zones are
  Gemeinde/Landkreis-level for DE.
- **ASO (German):** iOS `Leises Wetter` · subtitle `Nur amtliche Warnungen` · keywords:
  `wetterwarnung,unwetter,sturm,frost,glätte,dwd,warnung,gewitter,hitze` · Play short:
  `Amtliche Unwetterwarnungen — kein tägliches Gerede, keine Werbung, keine Angstmache.`
  Channels: German gardening communities (Frost pack — Eisheiligen culture makes freeze
  warnings resonate), r/de-adjacent weather threads, cycling commuter groups.
- **Risks:** the licensing checkpoint above; German incumbents (WarnWetter, Katwarn/NINA)
  are official apps — position as the *quiet filter* complement, never as a civil-protection
  substitute (say explicitly: "Für Katastrophenschutz: NINA" — the honesty is also the
  legal safety).

## 3. Shortage Watch DE — US sibling: [Shortage Watch](../10-quiet-alerts/18-shortage-watch.md)

**One sentence:** One calm alert when a medication you take enters — or leaves — the
official German shortage list, with your med list never leaving your phone.

- **Data sources:** **BfArM Lieferengpass database** (the German federal shortage list —
  public, downloadable; the structural twin of the FDA source) + EMA's shortage catalog for
  centrally authorized products. The German shortage discourse (Fiebersäfte, ADHD meds,
  antibiotics winters) is loud and recurring — the audience exists and is desperate,
  exactly as in the US.
- **Architecture:** the US plan's **on-device matching** design ports unchanged and matters
  even more here — under GDPR, medication data is Art. 9 special-category data, and the
  architecture means **we never process it at all**: the server ships the compact shortage
  list; matching and notifications are local. This makes the GDPR analysis clean (device
  token processing only) and the privacy page writes itself. The drug-name alias dataset is
  rebuilt on German naming (PZN-adjacent normalization, Wirkstoff/generic mapping — curate
  from public sources; document provenance).
- **MDR note:** factual display of regulator-published supply status; the intended-purpose
  statement (overview §3.4) gets written for this app first.
- **ASO (German):** iOS `Engpass-Radar: Medikamente` · subtitle `Wenn dein Mittel fehlt —
  und wiederkommt` (trim to ≤30 at submission) · keywords: `lieferengpass,medikament,
  apotheke,engpass,bfarm,arznei,verfügbar,wirkstoff` · Play short: `Eine ruhige Meldung,
  wenn dein Medikament auf der Engpassliste steht — oder wieder verfügbar ist.` Channels:
  German ADHD and chronic-illness communities, Apotheken-adjacent audiences (pharmacists
  field these questions daily — the r/pharmacy logic transfers). Review/Pro per the US plan;
  Supporter €5.99/yr.
- **Risks:** as the US plan (list-lag honesty, matching precision) plus German drug-name
  normalization quality — the golden corpus is rebuilt from real BfArM entries and gets the
  deepest test investment in this repo.

## 4. Family-wide launch order rationale

Recall Watch EU first (it stands up the EU backend against the richest source set), Quiet
Weather EU second (DWD-only fallback makes it low-risk while MeteoAlarm terms resolve),
Shortage Watch DE third (smallest backend surface, but its dataset curation is the long
pole). Air Alerts EU and Quake Watch EU (wave-2, §5) are cheap adds afterward.

## 5. Wave 2 (brief)

- **Air Alerts EU** — EEA air-quality data / national UBA (Germany) feeds + CAMS forecasts;
  the episode/hysteresis engine ports unchanged; European AQI conventions differ from US
  AQI (bands, pollutant emphasis) — the threshold presets get rebuilt on the EU index.
- **Quake Watch EU** — mostly localization: USGS is already global; add EMSC as a
  corroborating source and German-language presets (diaspora use case unchanged;
  Italy/Greece/Turkey place presets).
- **Holdings Calendar EU / Streaming Arrivals EU / Breach Watch EU** — all deferred:
  market-data licensing (EU corporate calendars), JustWatch-adjacent terms, and the Art. 27
  email-storage question respectively; each needs its own investigation before planning.
