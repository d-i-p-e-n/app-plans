# Growth Playbook — Adoption & Monetization (binding for every app)

Companion to [00-shared-standards.md](00-shared-standards.md). Every app plan has an
"Adoption & monetization" section containing that app's *inputs* (names, keywords, channels,
prompts); this document is the *process* the implementing agent executes with them. The two
must be used together.

## 1. Positioning formula

Every app's hook is the refusal: **{job} without {the thing people hate}**. "Subscription
tracker without bank linking." "Weather alerts without daily spam." Rules:

- Name the hated *category behavior*, never a competitor brand, in store metadata (Apple
  guideline 2.3.7 and Play metadata policy both bite; rejections cost weeks).
- Competitor-comparison language ("X alternative") lives on the web landing page (§6), where
  it is allowed and is exactly what people search.
- The quiet/no-account stance is a feature — it appears in the subtitle or short description
  of every app, not buried in the long description.
- **Refusals that remain claimable (2026-07 ads revision):** no accounts, no subscriptions,
  no bank/email linking, no lead-gen, no data *selling*, quiet notifications. **"No ads" and
  "no analytics/no data collected" are no longer claimable anywhere** — apps carry AdMob
  banners and Firebase telemetry per shared standards §9. The honest replacement line, used
  portfolio-wide: *"Free, with light banner ads — one purchase removes them forever."* Every
  per-app "Adoption & monetization" draft written before this revision must be swept for
  stale claims at implementation (shared standards §9.5); the per-app keywords, channels,
  and review moments remain valid.

## 2. Store identity mechanics

Field limits (verify against current store docs at submission; these were correct mid-2026):

| Field | Limit | Ranking weight |
|---|---|---|
| iOS app name | 30 chars | Highest |
| iOS subtitle | 30 chars | High |
| iOS keyword field | 100 chars | Medium (invisible to users) |
| iOS promotional text | 170 chars | None (editable without review — use for seasonal hooks) |
| Play title | 30 chars | Highest |
| Play short description | 80 chars | High |
| Play long description | 4000 chars | Medium (keyword relevance is extracted from it) |

Rules the agent must apply to each app's assets:

1. **Name formula:** `Brand: top search phrase` — the brand is short and ownable, the phrase is
   the highest-intent query that fits. Verify ≤30 chars *after* any punctuation.
2. **iOS keyword field:** comma-separated, **no spaces after commas**, no words already in the
   name/subtitle (those are already indexed — duplicates waste chars), no plural+singular
   duplicates, no category words ("app", "free"), no trademarks. Squeeze to ~95+ of the 100
   chars; every unused char is a lost query.
3. **Play:** title keyword matters most, then short description, then natural (2–3% density)
   usage in the long description. Keyword stuffing tanks conversion and risks policy action —
   write the long description for humans, then check the target phrases appear.
4. **Long description structure (both stores):** first 2 lines carry the refusal-hook and the
   top keyword (they show before "more"); then a scannable feature list; then the privacy
   paragraph; then the family cross-promo line (§5); then support/contact.
5. **Metadata iteration:** revisit quarterly using the consoles' search-terms/keyword reports
   (§9). One change at a time; ASO changes need 2–4 weeks to read.
6. Run the name through: both store searches, USPTO TESS, and domain availability before first
   submission. Working titles in these plans are unchecked.

## 3. Screenshots & preview video

- The first two screenshots do all the work — most users never swipe. Screenshot 1 = the
  refusal-hook as a big caption over real UI; screenshot 2 = the core payoff moment.
- Caption-first design: short claim text (≥28 pt equivalent) above a device frame; light and
  dark variants; consistent family style so store visitors learn the brand.
- The "never manifest" screenshot pattern (a plain list titled "What we'll never send you")
  is mandatory for quiet-alerts apps — it converts better than feature lists and no incumbent
  can copy it.
- Preview video only where motion sells (each plan says if so); otherwise skip — a mediocre
  video hurts conversion versus none.

## 4. Ratings & reviews engine

- Native prompts only (`SKStoreReviewController` / Play In-App Review). Exactly one trigger
  moment per app, defined in its plan ("Review prompt moment"). Never after a notification tap,
  never mid-task, never gated or incentivized, max once per version and per 120 days.
- Respond to every store review within 48h during the launch quarter, weekly after. Feature
  requests in reviews become repo issues; when shipped, reply to the original review — this
  converts 1–3 star reviews to 5 and signals a live developer.
- Never prompt in a stressed context (an active recall, an "act early" flag, a severe-weather
  event). Plans mark these exclusions; honor them.

## 5. Cross-promotion (the portfolio effect)

- Every app ships a static "More quiet apps" screen: bundled data, lists only released apps,
  one screen, reachable from Settings, never badged, never notified, no tracking parameters
  beyond standard store campaign links.
- Long description of every app ends with the family line: "From the maker of {two sibling
  apps} — small, quiet apps that respect you."
- Curate the developer page on both stores (ordering, family description) once ≥2 apps ship.

## 6. Web presence & SEO

- One umbrella static site (Astro or Eleventy on Cloudflare Pages; repo `quiet-site`), one page
  per app at `/{app}`, shared design. A single domain accumulating authority beats 23 scattered
  domains. Choose and register the umbrella domain at first app launch.
- Each app page targets: the "X without Y" phrase, the app's 3–5 question queries (listed in
  its plan's "Web/SEO queries"), and one honest comparison section ("{App} vs bank-linked
  trackers — when you'd prefer each"). Honest comparisons rank and convert; never trash-talk.
- Store-required pages (privacy policy, support) live on the same domain and are written as
  real content — the privacy policy is a marketing asset for this portfolio; make it readable
  and quotable.
- Add `SoftwareApplication` structured data, App Store smart banner, Play badge. FAQ sections
  phrased to match People-Also-Ask queries.
- No paid acquisition. The budget is $0 by design; organic + communities + press is the model.

## 7. Launch sequence (per app)

1. Landing page live (with "get notified" email capture via a static-friendly form service)
   before store submission.
2. Beta via TestFlight/Play internal track into the plan's named communities. Community rules:
   participate before posting, disclose being the developer, lead with the privacy/quiet stance
   and ask for critique, not installs. One post per community, ever — the goal is 20 honest
   testers, not reach.
3. Store launch; ask beta users (in-app thank-you screen, once) to leave an honest review in
   week one.
4. Show HN / Product Hunt only where the audience genuinely fits (privacy- and dev-adjacent
   apps: Renewals, Breach Watch, Quiet Weather, RSU Planner, Paycheck What-If). The HN title is
   the refusal-hook, the first comment is the architecture story (local-first, no accounts —
   HN's love language).
5. Press/newsletter pitches: the angle is never one app; it's "a solo portfolio of quiet,
   single-purpose apps that refuse ads, accounts, and data collection." Target privacy
   newsletters, personal-finance newsletters (calculators), parenting newsletters (Recall
   Watch, First Years).

## 8. Monetization optimization (2026-07 ads revision)

Launch state: **free with adaptive banner ads + a Remove-Ads one-time IAP ($2.99–$4.99,
Family Sharing ON), shipped in the MVP** — placements, consent, and formats per shared
standards §9; billing per §2/§6 there. All *features* remain free at launch; the
`hasFeature()` seam carries both `'no-ads'` (live) and future Pro flags.

**Remove-Ads price anchors:** $2.99 default; $3.99–$4.99 for the deep-engine calculators
(RSU Planner, Headroom class). Localized tiers: ₹99–₹199 India, and EUR/GBP/CAD/AUD store
equivalents.

**Pro feature unlocks (later, optional) — flip criteria unchanged, all three:**
1. ≥60 days in market with stable or growing weekly organic installs;
2. retention curve plateaued — a durable user base exists;
3. ≥3 independent organic requests clustering on a Pro-candidate feature.
Pro pricing per the original family anchors ($4.99–$9.99 one-time); Pro purchase always
includes Remove-Ads.

**Quiet-alerts server costs:** the optional Supporter annual ($5.99–$11.99/yr) remains
available where infrastructure costs are real (Breach Watch's early capacity gating stands);
Supporter also includes Remove-Ads, and its paywall copy states the real reason: "servers
and data feeds cost money."

**Iron rules (revised):**
- Never move a launched-free *feature* behind a paywall. Grandfather everything, loudly.
- A `'no-ads'` purchaser never sees another ad surface — including house ads — across
  reinstalls (store restore path tested every release).
- Banner-only forever is the format ceiling; interstitials/rewarded/app-open are not a
  future "optimization" (shared standards §9.1). Ad density never increases post-launch on
  an installed base — that's the enshittification move this portfolio exists to reject.
- Paywall/Remove-Ads screen: one screen, one price, what it does, no countdown timers, no
  fake discounts, no trial-that-autoconverts. The quiet brand extends to the paywall.

## 9. Measurement (2026-07 revision: Firebase-instrumented, content-blind)

- Sources: **Firebase Analytics + Crashlytics** (usage, retention, funnels, stability) plus
  App Store Connect / Play Console (impressions, conversion, search terms) plus AdMob
  (eCPM, fill, Remove-Ads conversion pressure). The content/usage wall of shared standards
  §9.3 is absolute: we measure *what people do*, never *what they entered*.
- Per-app event taxonomy lives in `docs/analytics-events.md` and is designed before code:
  each event names the decision it informs (activation step completed? core loop repeated?
  which screen precedes drop-off?). If an event answers no decision, it isn't logged.
- Weekly 20-minute ritual per live app: activation funnel + week-4 retention (Firebase),
  crash-free rate (Crashlytics), page conversion + search terms (consoles), ads eCPM vs
  Remove-Ads take-rate. Output: at most ONE metadata or product adjustment per app per week.
- Portfolio defaults: product-page conversion ≥25%, week-4 retention above category norm,
  review rating ≥4.6 sustained, crash-free users ≥99.5% — and Remove-Ads take-rate tracked
  as the honesty metric: rising take-rate with stable ratings means ads are tolerable;
  rising take-rate with falling ratings means placements are wrong. Fix placements; never
  add ad density (playbook §8 iron rule).

## 10. Pre-flight checklist (every release)

- [ ] Name/subtitle/keyword/short-desc within limits; keyword field de-duped against name+subtitle
- [ ] Trademark + store-collision + domain search done for the final name
- [ ] Screenshots light+dark, captions per §3, "never manifest" shot for quiet-alerts apps
- [ ] **Stale-claims sweep (§1 / shared standards §9.5):** no "no ads / ad-free / no
      analytics / no data collected / zero-network" language survives in metadata,
      screenshots, privacy pages, or in-app manifests
- [ ] Privacy questionnaire/labels declare Identifiers, Usage Data, Diagnostics, and
      advertising data; iOS ATT usage string present; answers match the privacy policy page
- [ ] UMP consent flow configured in the AdMob console and tested with EEA test geography;
      ATT pre-prompt + system prompt verified; non-personalized fallback confirmed
- [ ] `app-ads.txt` live on the umbrella domain; AdMob seller verification complete
- [ ] Remove-Ads purchase and store restore path tested on both platforms; purchaser sees
      zero ad surfaces; ad slots collapse cleanly offline
- [ ] Test-device IDs / test ad units used throughout dev; Crashlytics symbol upload (dSYM /
      mapping) wired into the EAS build
- [ ] `docs/analytics-events.md` and `docs/ad-placements.md` exist and match the build
- [ ] Landing page live with structured data; support + privacy URLs set in both consoles
- [ ] Review-prompt moment implemented via native API with the plan's exclusions honored
- [ ] Cross-promo screen lists only live apps
- [ ] Long description ends with the family line; first 2 lines carry hook + top keyword
