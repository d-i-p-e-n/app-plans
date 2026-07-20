# Breach Watch — Plan

**One sentence:** One push when an email address you monitor appears in a newly disclosed data
breach — and what to do about it, in two sentences.

Read [../00-shared-standards.md](../00-shared-standards.md),
[00-family-overview.md](00-family-overview.md), and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Reuses the shared backend. **This is
the only app in the portfolio that stores user PII (email addresses) and the only one with real
per-user API cost — §2 and §7 are load-bearing.**

## 1. Product

- **Audience:** privacy-conscious people (the beachhead — they evangelize), plus everyone who
  saw a breach headline and wondered "was I in it?" Families: monitor a parent's or kid's email.
- **Gap:** Have I Been Pwned is the authoritative source but its notification service is
  email-only and single-address-centric; identity-monitoring incumbents (LifeLock-class) are
  expensive fear engines that upsell insurance. Nobody ships a quiet mobile push with a calm,
  concrete "do these two things" response.
- **Tone rule:** calm competence, never fear. Every alert leads with the fix, not the threat.

Non-goals: dark-web-scan theater, identity insurance, credit monitoring, password manager
features (we link to the concept, we don't build one), SSN/phone monitoring (email only —
scope discipline is the trust story).

## 2. The privacy tension, handled honestly

Monitoring an email requires storing it server-side — a charter deviation. It is the entire
service, so we do it with the narrowest possible blast radius and total disclosure:

- `monitored_emails` table: `device_id`, `email_encrypted` (pgsodium/pgcrypto, key in Supabase
  Vault), `email_hash` (SHA-256, for dedupe/joins), `alias` (user's label — "work", "mom"),
  `created_at`. **Nothing else. No names, no other fields, ever.**
- Emails never appear in logs, error messages, or push payloads (pushes use the alias — lock
  screens are semi-public).
- Delete = immediate hard delete via device-scoped RPC; deleting the app's last email deletes
  the device row too.
- RLS: no direct table access; `security definer` RPCs only, authenticated by device secret
  (family overview pattern).
- The in-app privacy page states exactly this, in this order, in plain language. It is the
  first onboarding screen, not fine print: "To watch an address we have to keep it. Here is
  precisely what we keep, how it's stored, and the delete button."

## 3. Data sources & cost

| Source | What | Auth/cost |
|---|---|---|
| HIBP `breachedaccount` API | Breaches for a specific email | **Paid subscription key** — entry "Pwned 1" tier (~$4.50/mo class, rate-limited ~10 RPM); higher tiers raise RPM. Re-verify pricing/tiers at build time |
| HIBP `breaches` API | Catalog of all breaches (metadata) | Free, unauthenticated |
| HIBP Pwned Passwords range API | k-anonymity password check | Free, unlimited, **client-side** |

Cost model (write into `docs/data-sources.md` with real numbers at build time): the paid key is
a fixed monthly cost; the RPM tier caps how many monitored emails we can sweep per day
(10 RPM ≈ 14k checks/day). Launch caps: **≤3 emails per device**, sweep cadence computed from
(total monitored emails ÷ RPM budget), floor weekly, target daily. When organic growth
approaches the tier ceiling, that is the sanctioned early-monetization trigger (playbook §8):
extra email slots become the first paid feature in the portfolio, priced to cover the next
HIBP tier. Track headroom in the weekly metrics ritual.

## 4. Alert logic (`packages/domain-breach`)

1. **New-breach fast path:** poll free `breaches` catalog every 6h; on a new breach, sweep all
   monitored emails against `breachedaccount` (rate-limit-aware queue, spread over hours).
   Push on hits.
2. **Rotation sweep:** all emails re-checked on the computed cadence (catches quiet additions
   to old breaches and newly added emails' backlog).
3. **First-add backfill:** when a user adds an email, check it immediately; existing historical
   breaches are shown **in-app only** (badge + list), with a single summary push option
   ("Found {alias} in 7 past breaches — review when ready") — historical exposure is not an
   emergency and must not be dressed as one.
4. **Push copy pattern (calm, fix-first):** "{alias}: appeared in the {Breach} breach
   ({Month Year}). Exposed: passwords, phone numbers. Do this: change that password anywhere
   you reused it; turn on 2FA." Deep link → breach detail with HIBP attribution and a short
   checklist the user can tick off.
5. Events: `external_id = '{email_hash}:{breach_slug}'` — natural idempotency. Never break
   quiet hours (breaches are months old by disclosure time; urgency theater is the competitor's
   product).
6. **Password check tool (client-side, free):** SHA-1 prefix k-anonymity range query — the
   password never leaves the device even hashed-in-full. A useful standalone tool and the
   honest upsell surface for "use a password manager."

## 5. Screens

- `/(onboarding)`: the privacy disclosure (§2) as screen one → add first email + alias →
  push opt-in. The disclosure-first onboarding is deliberate brand.
- `/` **Monitored:** one card per email (alias shown large, address small): status ("No new
  breaches" / "1 to review"), historical count, last-checked timestamp (honesty about sweep
  cadence).
- `/email/[id]`: breach list (new vs acknowledged), delete-this-email button (prominent, works
  instantly).
- `/event/[id]`: breach detail — what/when/what leaked (HIBP data classes), the fix checklist
  (change password / enable 2FA / watch for phishing), "mark handled".
- `/password-check`: the k-anonymity tool with a one-paragraph explanation of why this is safe.
- `/settings`: standard family settings + the privacy page + HIBP attribution (required by
  their license — verify current requirements) + the "never" manifest (no fear pushes, no
  dark-web theater, no upsells to insurance).

## 6. Phases & acceptance criteria

1. **Privacy plumbing first:** encrypted storage, RPCs, hard-delete paths, log-scrubbing audit
   (grep the whole pipeline for any path where a plaintext email could hit logs); a written
   `docs/privacy-audit.md` with the checklist and results. Blocking gate.
2. **Domain + ingest:** breach-catalog poller, rate-limit-aware sweep queue (Jest-tested with a
   fake clock: N emails × RPM budget → schedule), backfill logic, alert decisions.
3. **App:** onboarding, monitored list, detail, password check, delete flows (acceptance: add →
   verify row encrypted in DB → delete → verify gone, automated test against local Supabase).
4. **Push E2E:** new-breach fixture → alias-only push on physical devices; historical backfill
   produces no individual pushes.
5. **Release:** EAS, listing (§8), privacy questionnaire — this app declares email collection
   ("Data linked to you: contact info — email"), the only app in the portfolio that does;
   answer truthfully and explain in the privacy policy why it differs from siblings.

## 7. Risks

- **HIBP dependency is total.** Terms or pricing changes hit the product directly; the
  abstraction layer is thin here by necessity. Mitigation: cost headroom monitoring (§3), and
  the email-slot paywall as the pressure valve. No scraping fallback exists — if HIBP access
  ends, the app sunsets honestly.
- Fear-tone creep in copy or notifications kills the differentiation — copy audit gate like
  Claiming Age's (calm, fix-first, no red pulsing shields).
- Storing emails makes this the portfolio's honeypot — the phase-1 privacy audit is not
  optional, and the schema must never grow another PII column.

## 8. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Breach Watch: Leak Alerts
- **iOS subtitle:** Know when your email leaks
- **iOS keyword field:** data,breach,pwned,password,hack,security,privacy,monitor,identity,dark,web,protect,2fa
- **Play title:** Breach Watch: Leak Alerts
- **Play short description:** One calm alert when your email shows up in a new data breach. No fear, no upsells.
- **Keyword targets:** primary "data breach alert", "have i been pwned"; long-tail "was my email in a breach app".
- **Play long description — first two lines:** "One notification when an email you monitor appears in a newly disclosed data breach — with the two things to actually do about it. No dark-web theater, no insurance upsells, no fear."
- **Screenshot story:** disclosure-first onboarding ("here's exactly what we store") → alias-only lock-screen push → fix-first breach detail → password check tool.
- **Launch channels:** Show HN (architecture + privacy-tension story is ideal HN material), r/privacy, r/cybersecurity_help, privacy newsletters (Proton/Tuta-adjacent audiences); HIBP community goodwill — attribute loudly.
- **Review prompt moment:** after the user marks a breach "handled" (competence moment). Excluded: any moment within 24h of receiving a breach push.
- **Pro candidates & anchor:** additional email slots (4–10) and family monitoring — the portfolio's sanctioned early flip, priced against HIBP tier costs (~$7.99/yr class); core 3 emails stay free.
- **Web/SEO queries:** "app that alerts when email is in data breach", "have i been pwned app with notifications", "data breach monitor without subscription", "is breach monitoring worth it".
