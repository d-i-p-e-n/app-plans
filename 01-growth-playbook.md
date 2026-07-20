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
- The privacy/quiet stance is a feature — it appears in the subtitle or short description of
  every app, not buried in the long description.

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

## 8. Monetization optimization

Launch state: everything free, `hasFeature()` seam everywhere (shared standards §6).

**Flip criteria — flip an app to Pro only when all three hold:**
1. ≥60 days in market with stable or growing weekly organic installs;
2. retention curve plateaued (consoles' retention view) — i.e., a durable user base exists;
3. ≥3 independent organic requests (reviews/emails) clustering on a Pro-candidate feature.

**Model by family:**
- Calculators, life-admin, standalone: **one-time Pro unlock**, $4.99–$7.99 anchor ($9.99 for
  RSU Planner and Headroom — high-income audiences, deep engines). Family Sharing ON.
- Quiet-alerts: core free forever; optional **Supporter/Pro annual** $5.99–$11.99/yr, paywall
  copy states the real reason: "servers and data feeds cost money; this keeps the app quiet
  and ad-free." Breach Watch is the sanctioned exception that may gate capacity (extra
  monitored emails) earlier — it has real per-user API cost (its plan details this).

**Iron rules:**
- Never move a launched-free feature behind the paywall. Grandfather everything, loudly —
  early adopters become the marketing.
- Pro adds *new power features* from each plan's "Pro candidates" list only.
- No ads, ever, as a monetization pivot. No "remove ads" tier can exist because ads can't.
- Paywall screen (when it exists): one screen, full feature list, one price, no countdown
  timers, no fake discounts, no trial-that-autoconverts. The quiet brand extends to the
  paywall.
- Implementation when flipping: RevenueCat or bare StoreKit 2 / Play Billing — decide then;
  the `hasFeature()` seam means this is an additive change.

## 9. Measurement without surveillance

- Sources: App Store Connect and Play Console analytics only. No in-app analytics SDKs
  (charter). Accept the blindness; the stores' data is enough to steer.
- Weekly 20-minute ritual per live app: impressions → product-page conversion rate, search
  terms driving impressions, retention curves, review themes. Output: at most ONE metadata or
  product adjustment per app per week.
- Success definitions live in each plan; as a portfolio default: product-page conversion ≥25%
  (niche apps with tight keyword targeting should beat this), week-4 retention above category
  norm, review rating ≥4.6 sustained.

## 10. Pre-flight checklist (every release)

- [ ] Name/subtitle/keyword/short-desc within limits; keyword field de-duped against name+subtitle
- [ ] Trademark + store-collision + domain search done for the final name
- [ ] Screenshots light+dark, captions per §3, "never manifest" shot for quiet-alerts apps
- [ ] Privacy questionnaire answers match the architecture (and the privacy policy page)
- [ ] Landing page live with structured data; support + privacy URLs set in both consoles
- [ ] Review-prompt moment implemented via native API with the plan's exclusions honored
- [ ] Cross-promo screen lists only live apps
- [ ] Long description ends with the family line; first 2 lines carry hook + top keyword
