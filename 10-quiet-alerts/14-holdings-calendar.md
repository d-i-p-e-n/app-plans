# Holdings Calendar — Plan

**One sentence:** Earnings, ex-dividend, and split dates for the tickers you type in — no brokerage
linking, no news, no hype.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[00-family-overview.md](00-family-overview.md) first. Reuses the shared backend. Natural audience
overlap with the Options Pricing Suite — cross-promote in both directions.

## 1. Product

- **Audience:** self-directed investors who hold 5–40 positions and just want to not be surprised
  by an earnings print or miss an ex-dividend date. Options sellers (OptionPricer users) care
  intensely about earnings dates and ex-div assignment risk.
- **Gap:** every incumbent (brokerage apps, Yahoo, Robinhood) buries the calendar under feeds,
  price hype, and engagement mechanics, and the standalone tools want Plaid access. Manual
  watchlist + quiet push is unserved.
- **Trust posture:** we never know what the user *owns* — only tickers they typed. Say this
  everywhere.

Non-goals: prices/quotes in notifications, price alerts (different product, engagement bait
adjacent), news, portfolios with quantities/cost basis (a ticker list, not a portfolio), chat.
No investment advice of any kind — dates and facts only (see calculators family disclaimer
language; reuse it).

## 2. Data sources (provider abstraction is mandatory)

Free-tier corporate-calendar data is the weakest data situation in the family. Build
`packages/provider-markets` with a `CalendarProvider` interface
(`getEarnings(tickers, range)`, `getDividends(tickers, range)`, `getSplits(tickers, range)`) and
at least two implementations behind it:

| Provider | Free tier (verify at build time) | Notes |
|---|---|---|
| Finnhub | 60 calls/min free key | `/calendar/earnings`, `/stock/dividend`, `/stock/split`; some endpoints have moved to paid tiers before — verify each |
| Alpha Vantage | ~25 req/day free key | `EARNINGS_CALENDAR` (3-month CSV covering all tickers in one call — good daily bulk source), `DIVIDENDS`, `SPLITS` |
| Nasdaq/company IR pages | n/a | Do **not** scrape; ToS risk. If free tiers die, the fallback is a paid tier (Finnhub or FMP) — record cost analysis in `docs/data-sources.md` |

Server-side only; keys never ship in the client. Cache aggressively: the subscribed-ticker
universe is small (thousands, not millions) and dates change rarely. Cross-check: when two
providers disagree on an earnings date, mark it `unconfirmed` (shown in-app with a ⚠, notified
only once confirmed or 1 day prior, whichever first).

## 3. Alert types & budget (`packages/domain-holdings`)

Per ticker, user toggles (defaults in parens):

1. **Earnings ahead** (on): push 1 trading day before, at 16:30 ET the prior session: "NVDA
   reports earnings tomorrow after the close." Timing detail (BMO/AMC/unspecified) included when
   the provider gives it.
2. **Earnings date changed** (on): only if a previously confirmed date moves ≥2 days.
3. **Ex-dividend ahead** (on): push 1 trading day before ex-date: "KO goes ex-dividend tomorrow
   ($0.485/share)." Options sellers' assignment-risk use case: include "record date / pay date"
   in detail view only.
4. **Split announced/effective** (on): announcement once, effective-day morning once.
5. **Dividend change** (off by default): raised/cut vs prior payment — only on explicit toggle
   (edges toward news).

Budget: batching rule — all same-day items collapse into one push per day at most ("Tomorrow:
NVDA earnings; KO, PEP ex-dividend"). Never break quiet hours; earnings-tomorrow push lands
16:30–18:00 local. Absolute cap: 1 push/day.

Synthetic events: `external_id='{ticker}:{kind}:{date}'` — natural idempotency on date moves
(changed date = new event; dispatch logic suppresses stale one).

## 4. Backend

- Subscriptions: `topic_type='ticker'`, `topic_key='NVDA'`, params = per-type toggles. Cap 50
  tickers/device (raiseable later via `hasFeature('unlimited-items')`).
- `ingest-calendar`: daily 05:00 ET bulk (Alpha Vantage CSV path) + hourly Finnhub delta for
  near-term confirmations of tickers with events in the next 5 days. Writes `events` with
  `match_keys=['ticker:NVDA']`.
- US-listed common stocks + ETFs at launch (dividend ETFs work fine); ADRs best-effort.
- `dispatch`: shared; batching per §3 implemented in `domain-holdings` decision layer.

## 5. Screens

- `/(onboarding)`: promise ("No prices. No news. No linking your brokerage — we never know what
  you own.") → add tickers (type-ahead against a bundled symbol list, refreshed server-side
  monthly) → toggles → push opt-in.
- `/` **Calendar:** agenda list, next 30 days, grouped by day: earnings/ex-div/split chips per
  ticker; ⚠ for unconfirmed. Empty week: "Nothing scheduled for your tickers."
- `/tickers`: manage list + per-ticker toggles.
- `/event/[id]`: detail — dates (announce/ex/record/pay for dividends; date + session for
  earnings), provider-confirmation status, link out to the company's IR page via a simple
  `https://www.google.com/search?q={ticker}+investor+relations` fallback when no IR URL known
  (never deep-link a news site).
- `/settings`: standard family settings + data-provider attribution + the disclaimer ("Dates can
  change; verify before trading. This app provides factual dates, not advice.").

## 6. Phases & acceptance criteria

1. **Provider layer:** `CalendarProvider` interface + 2 implementations + disagreement logic;
   recorded fixtures for both providers; contract tests run against fixtures (live smoke test
   script in `docs/`, not in CI).
2. **Domain:** batching/budget/date-change logic golden-tested: date move, BMO/AMC, multi-ticker
   same-day collapse, unconfirmed suppression, DST/ET boundary handling (all schedule math in ET
   then converted per device timezone).
3. **Backend:** ingest on schedule; ticker-universe caching (one provider call per ticker per
   cycle regardless of subscriber count).
4. **App:** full screens; symbol type-ahead offline-capable.
5. **Push E2E** + **Release** per family standard. Privacy questionnaire: anonymous ID + ticker
   strings (declare as "product interaction data not linked to identity").

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Holdings: Earnings Calendar
- **iOS subtitle:** Ex-div & earnings alerts
- **iOS keyword field:** stock,dividend,ex dividend,dates,watchlist,splits,investing,ticker,portfolio,reminder
- **Play title:** Holdings: Earnings Calendar
- **Play short description:** Earnings & ex-dividend alerts for your tickers. No prices, no news, no login.
- **Keyword targets:** primary "earnings calendar", "ex dividend date alerts"; long-tail "earnings date reminder for my stocks", "dividend calendar app no account".
- **Play long description — first two lines:** "Don't get surprised by an earnings print or miss an ex-dividend date again. Type in your tickers — we never link a brokerage, so we never know what you own — and get one quiet evening push before anything important."
- **Screenshot story:** agenda week view → single batched evening push → event detail with confirmation status → "we never know what you own" privacy shot.
- **Launch channels:** r/dividends, r/thetagang and r/options (ex-div assignment-risk angle), Bogleheads forum; cross-promote from the Options Pricing Suite app (shared audience).
- **Review prompt moment:** first app open after a week containing at least one correctly delivered alert. Excluded: sessions showing an unconfirmed-date warning.
- **Pro candidates & anchor:** >50 tickers, per-ticker lead-time customization; Supporter $11.99/yr — this app has real data costs and is the family's most defensible future subscription (playbook §8).
- **Web/SEO queries:** "earnings date reminder app", "ex dividend date alert app", "earnings calendar for watchlist without brokerage login", "stock split notification app".

## 8. Risks

- **Provider free-tier fragility is the #1 risk.** The abstraction layer + cost memo is the
  mitigation; if this app ever charges, it's the family's most defensible subscription
  (real data costs), but launch free per the portfolio decision.
- Wrong dates burn trust: the two-provider confirmation rule and `unconfirmed` state exist for
  this; never push an unconfirmed date except day-prior best-effort with "(unconfirmed)".
- Scope creep toward prices/news is the product death spiral — the "never" manifest for this app
  is: no prices, no news links, no analyst content, no price alerts.
