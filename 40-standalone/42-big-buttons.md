# Big Buttons — Plan

**One sentence:** A handful of huge, obvious, single-purpose tools for elderly users — installed
and configured by their adult children in five minutes.

Read [../00-shared-standards.md](../00-shared-standards.md) first. Standalone repo
(`big-buttons`), local-first, no backend. Reuse `local-core` patterns (copy-in, same as
Shift Life).

## 1. Product

- **Audience & buyer split (the key insight):** the *user* is an elderly person with declining
  vision/dexterity/tech confidence; the *buyer/installer* is their adult child during a visit.
  Incumbents ignore elders because they don't monetize via ads; the adult child searches
  "easy phone app for elderly parent" with money-and-guilt intent. Design every decision for
  the split: setup complexity lives with the child, daily use has zero complexity.
- **MVP = one app, four tools** on a home screen of 4 giant tiles:
  1. **Weather** — today + tomorrow, huge type, plain words ("Cold this morning. Rain after
     lunch."), no radar, no hourly grid. Open-Meteo, client-side, cached, no key
     (re-verify non-commercial terms, same as Quiet Weather; the app is free).
  2. **Magnifier + light** — camera zoom + torch + freeze-frame + high-contrast filter. The
     single most-used elder utility.
  3. **Call sheet** — 6 photo tiles → confirmation screen ("Call Maria?") → dials via the OS
     dialer (`tel:` link — we never place calls silently; the confirmation prevents pocket-
     dials of 911-adjacent contacts).
  4. **Reminders** — medication and appointment reminders that speak plainly ("Morning pills,
     with breakfast") with huge done/snooze; local notifications; a persistent "what's next
     today" line on the tile.

Non-goals: fall detection / emergency SOS (life-safety liability — hardware/OS features do this;
we link to the phone's own SOS setup in the guide), messaging/photos-sharing platform features,
health tracking, voice assistant, launcher-replacement mode (Android launcher is Phase 7 at
most; app-first proves demand).

## 2. Accessibility charter (this app's binding law)

- Base type ≥22 pt body / ≥34 pt actionable text at default OS scale; layouts must survive OS
  font scale 200% + our own "even bigger" toggle (test matrix: both, combined).
- Touch targets ≥64 pt in daily-use surfaces; single-column layouts; no horizontal swipes, no
  long-presses, no pull-to-refresh, no gesture-only affordances anywhere in elder-facing
  screens. Everything is a visible labeled button.
- Contrast ≥7:1 (WCAG AAA) in both themes; a high-contrast theme is the default, not an option.
- Every interactive element: `accessibilityLabel` + TalkBack/VoiceOver walkthrough test in the
  release checklist.
- Confirmation over undo: destructive/outward actions (calling) confirm with big Yes/No; no
  toasts (they vanish before being read) — state changes announce inline and persist.
- No time-based UI (nothing auto-dismisses), no modals stacking, back always goes home.

## 3. Setup Mode (the adult-child surface)

- Entered from a small "Setup" link on the home screen behind a hold-3-seconds + simple
  arithmetic gate ("what is 7 + 4?" — deliberate friction that stops accidental entry without
  infantilizing; documented in-app copy reviewed for dignity).
- Setup tasks: choose the 4 tiles' order/visibility, add call-sheet contacts (name, photo from
  camera/library, number — typed or picked via `expo-contacts` **one-shot picker only**, no
  bulk contact import, no contact upload anywhere), enter reminders (name, times, days, spoken
  phrasing preview), set location for weather (ZIP), type-size test screen ("can they read
  this from arm's length?").
- **Remote-config-without-accounts:** Setup Mode exports the entire configuration as a QR code /
  file (same share-code trick as Shift Life). The child can prepare config on their own phone's
  copy of the app and apply it to the parent's phone by scanning during a visit — or email the
  file for a grandchild to apply. No server, no accounts, honest about its limits (changes need
  physical access; that's also a safety feature).

## 4. Domain & structure

```text
apps/big-buttons/
packages/domain-reminders/    Schedule math (times × days, snooze policy, next-up computation)
packages/config-share/        Config serialization ↔ QR/file (versioned, forward-compatible)
packages/ui-elder/            The accessibility-charter component kit (BigTile, BigButton,
                              ConfirmScreen, StatusLine) — every elder-facing screen composes
                              ONLY these primitives; charter compliance is enforced here once
packages/entitlements/
```

Reminder engine rules: fixed daily/weekly times; "done" logs locally (a simple adherence view
in Setup Mode only — visible to the child during visits, never nagging the elder); snooze =
+30 min, max 2; missed reminders roll off at day end without guilt copy ("Missed" never appears
on elder surfaces — the next reminder simply comes).

## 5. Screens (elder-facing)

- `/` **Home:** 4 tiles + the what's-next line + a clock/date header (elders consistently cite
  wanting the date big). Nothing else. No settings icon (Setup link is small text at bottom).
- `/weather`, `/magnifier`, `/calls`, `/reminders` — each per §1; each has one job, a Home
  button, and nothing that scrolls if avoidable (weather fits one screen; call sheet paginates
  with a big "More" button at >6 contacts).
- `/(setup)/*` — normal-density UI (child is the user), per §3.

## 6. Phases & acceptance criteria

1. **`ui-elder` kit:** primitives with the charter encoded (type/contrast/target-size tokens);
   storybook-style gallery screen; 200%+bigger matrix screenshots reviewed.
2. **Four tools:** each functional per spec; magnifier performance on mid-tier Android (zoom
   latency <100 ms); reminders E2E with app killed + reboot reconcile; call confirmation flow.
3. **Setup Mode:** full config + QR export/apply round-trip between two devices; arithmetic
   gate; contacts one-shot picker.
4. **Real-user test:** ≥3 sessions with actual 70+ testers observed doing: check weather, call
   a contact, complete a reminder, use magnifier on a pill bottle. Fix what they stumble on;
   log findings in `docs/usability-2026.md`. This phase is not skippable.
5. **Release:** EAS both stores; listing targets the adult child (below); privacy "no data
   collected."

## 7. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle. All store copy speaks to
the **adult child** (the buyer/installer); in-app copy never says "for seniors" (dignity rule, §8).

- **iOS name:** Big Buttons: Simple Tools
- **iOS subtitle:** For parents & grandparents
- **iOS keyword field:** seniors,elderly,large,text,magnifier,medication,reminder,easy,phone,grandma,accessibility
- **Play title:** Big Buttons: Simple Tools
- **Play short description:** Huge, simple tools for seniors: weather, magnifier, one-tap calls, reminders.
- **Keyword targets:** primary "apps for seniors", "big button app"; long-tail "easy phone apps for elderly parents", "medication reminder for elderly".
- **Play long description — first two lines:** "Set it up during Sunday's visit; they use it every day after. Four huge, obvious tools — plain-words weather, a magnifier with light, one-tap photo calling, and gentle medication reminders — with zero menus, zero gestures, zero ads."
- **Screenshot story (speaks to the child):** "Set it up during Sunday's visit" → the home screen at arm's length → call confirmation → magnifier on a prescription label → QR config transfer.
- **Launch channels:** r/AgingParents (the buyer, precisely), caregiver forums and newsletters, "setting up a phone for an elderly parent" SEO content, senior-center and social-worker one-pagers, area-agency-on-aging resource lists.
- **Review prompt moment:** in Setup Mode only, after a config is successfully applied (the child rates; the elder-facing surface never shows a prompt).
- **Pro candidates & anchor:** additional tiles, multiple config profiles (two parents); one-time $6.99 — the child pays gladly; the elder never sees a paywall.
- **Web/SEO queries:** "simple apps for elderly parents", "how to set up phone for grandparent", "big button apps for seniors", "magnifier app for seniors easy".

## 8. Risks

- Dignity in copy — the app must never talk down; elder-facing copy audit with the same rigor
  as Claiming Age's compliance audit ("for seniors" appears in the store listing, never in the
  app itself).
- Medication reminders carry an implicit reliability promise — reminder delivery gets the
  strictest testing in the portfolio (kill/reboot/DND/battery-saver matrix on 3 Android OEMs;
  document per-OEM battery-optimization caveats in Setup Mode with per-brand instructions).
- Camera permission for magnifier at first use needs a pre-prompt in plain language; a denied
  permission must produce a readable recovery screen, not a broken tool.
