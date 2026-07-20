# Noise — Plan

**One sentence:** Rain, fan, and brown noise that loop perfectly, work offline, and never ask
for $70 a year.

Read [../00-shared-standards.md](../00-shared-standards.md) and
[../01-growth-playbook.md](../01-growth-playbook.md) first. Standalone repo (`noise`).
The portfolio's purest anti-subscription statement and its most mass-market app.

> **Policy revision (2026-07):** per shared standards §1.2/§9, this app now includes Firebase
> Analytics + Crashlytics and AdMob banners with the Remove-Ads IAP and full consent stack —
> the "zero network" and "ad-free" claims below are superseded; regenerate store/privacy copy
> at implementation (§9.5 sweep). The anti-*subscription* positioning ("No subscription.
> Ever.") remains true and remains the brand; "never sends a notification" also survives.
> Placement call per §9.1: the night-time playback screen is an ad-free surface (a lit banner
> in a dark bedroom is a one-star generator) — banners live on the sound-browsing/settings
> surfaces, and the Remove-Ads purchase is expected to be this app's main revenue.

## 1. Product

- **Audience:** everyone who sleeps — plus the acute segments: parents of infants (white noise
  is universal newborn practice; First Years cross-promo), light sleepers with loud
  environments, focus/ADHD users masking open offices, shift workers day-sleeping (Shift Life
  cross-promo).
- **Gap:** the category is the poster child of subscription enshittification — looping rain
  audio behind $60–80/yr paywalls (BetterSleep/Calm-class), "free" apps stuffed with ads
  between sleep sounds, and content treadmills (stories, meditations) bolted on to justify
  renewals. The actual job — a dozen excellent sounds, a mixer, a timer that fades — is a
  finished product, not a service. Selling it as a service is the scam; saying so is the
  marketing.
- **Core loop:** open → tap rain → set 45-minute fade timer → sleep. Second session: two taps
  (last mix remembered). There is no third feature.

Non-goals — **the anti-treadmill wall:** no sleep tracking, no meditations/stories/content
library, no accounts, no streaks or "sleep scores," no seasonal content drops, no
notifications of any kind (this app never pushes, ever — uniquely in the portfolio, not even
opt-in ones). A sound machine does not talk back.

## 2. The sound set (the actual product — treat as an engineering asset)

Twelve sounds at launch, chosen to cover the real use cases, no filler:
rain (steady), rain (heavy/storm distant), brown noise, pink noise, white noise, box fan,
ocean waves, stream, crickets/night, train interior, café murmur, dryer/laundry.

Engineering requirements (these are what the subscription apps actually get right and free
apps get wrong — match them):
- **Provenance:** every file commissioned, self-recorded, or licensed with a written chain
  documented in `docs/audio-licenses.md`. No "found on the internet" audio, no CC-BY with
  attribution ambiguity — own it outright or license it perpetually. Budget line item; flag to
  the user (owner) before commissioning.
- **Loop craft:** seamless loops (crossfade-engineered endpoints, no perceptible seam over an
  8-hour session), loudness-normalized across the set (LUFS-matched so mixing doesn't lurch),
  encoded efficiently (AAC ~96–128 kbps is transparent for noise content) — **total bundle
  target <50 MB**.
- **Noise colors generated, not sampled:** brown/pink/white synthesized at build time (or
  runtime DSP if trivial) — mathematically perfect loops, zero file size.

## 3. Playback engineering (the technical risk — solve first)

Gapless, mixable, hours-long background audio is the whole app; `expo-av`'s looping has
audible-gap history. Phase 1 is a **spike**: evaluate `expo-audio` (current SDK),
`react-native-track-player`, and a thin custom module (AVAudioEngine loop nodes on iOS /
ExoPlayer `LOOP_MODE` + AudioTrack on Android) against these acceptance tests on device:
1. 8-hour session, screen locked: zero gaps, zero drops (record output to verify seams).
2. Mix of 3 sounds with independent volumes; <1% battery/hour beyond baseline audio playback.
3. Lock-screen / control-center controls (play/pause, our timer visible as track metadata).
4. Correct audio-session behavior: ducks nothing, survives brief interruptions (alarm, call)
   and **resumes**, respects the user's alarm (never blocks it — test with the OS alarm
   explicitly, this is a sleep app's cardinal sin).
5. Reboot/app-kill: playback obviously stops; reopening restores last mix in one tap.
Pick the lightest option that passes; document the choice in `docs/`.

## 4. Features (complete list — the restraint is the spec)

- Sound grid (12 tiles, instant start on tap), mix mode (up to 3 concurrent, per-sound volume
  sliders), master volume.
- Sleep timer: 15/30/45/60/90 min + custom, with a true 60-second fade (not a cut); "all
  night" mode explicitly listed too.
- Saved mixes (3 free — `hasFeature` seam for more), last-state restore.
- Baby corner: nothing special in the audio, but a settings page notes the AAP
  safe-volume/distance guidance for infant white noise with a citation — informational,
  one paragraph, the kind of care parents screenshot.
- Accessibility: the entire app usable with VoiceOver eyes-closed (it's a sleep app — test it
  in the dark, literally).
- Big-screen friendliness: keep-awake off, true black OLED theme, brightness-respecting UI.

## 5. Phases & acceptance criteria

1. **Playback spike:** §3's five tests green on physical iOS + 2 Android OEMs before any UI
   investment. This gate is absolute.
2. **Sound set:** 12 sounds sourced/licensed with the documented chain; loop-seam and
   LUFS-normalization verification (scripted analysis in CI where possible); bundle <50 MB.
3. **App:** grid, mixer, timer with fade, saved mixes, last-state restore; the two-tap
   second-session flow measured.
4. **Torture pass:** 8-hour nightly runs across the device matrix; alarm-interaction test;
   battery measurement documented.
5. **Release:** EAS, listing (§6), "no data collected" (trivially true: no network).

## 6. Adoption & monetization

Execute per [../01-growth-playbook.md](../01-growth-playbook.md); verify all character limits at
submission and de-duplicate keyword-field terms against name/subtitle.

- **iOS name:** Noise: Sleep Sounds
- **iOS subtitle:** No subscription. Ever.
- **iOS keyword field:** white noise,rain,baby,fan,brown noise,relax,focus,timer,offline,machine,calm sounds
- **Play title:** Noise: Sleep Sounds
- **Play short description:** Rain, fan & brown noise. No subscription, no account, works offline.
- **Keyword targets:** primary "white noise", "sleep sounds"; long-tail "white noise app without subscription", "brown noise for focus free".
- **Play long description — first two lines:** "Looping rain audio is not a $70-a-year service. Noise is a finished product: twelve carefully engineered sounds that loop seamlessly all night, a mixer, and a timer that fades — offline, ad-free, account-free, and it never sends a notification."
- **Screenshot story:** the sound grid → 45-min fade timer → 3-sound mix → "No subscription. Ever." stance shot → the AAP infant-volume note (the care-signal screenshot).
- **Launch channels:** Show HN (the anti-subscription rant + audio-engineering writeup is ideal HN material), r/NewParents (white noise is universal there — pair with First Years), r/ADHD (focus noise), r/shiftwork (pair with Shift Life); the category has huge incumbents on head terms, so the wedge is the "no subscription" long-tail plus community trust.
- **Review prompt moment:** at the seventh completed timer session (counted locally) — on next *daytime* open, never at bedtime. Excluded: any session where playback visibly failed.
- **Pro candidates & anchor:** additional sound packs (commissioned, owned, one-time), saved mixes beyond 3; one-time $3.99. The core twelve sounds and timer stay free forever — the statement is the strategy.
- **Web/SEO queries:** "white noise app without subscription", "free rain sounds app no ads offline", "brown noise vs white noise for sleep", "is white noise safe for babies volume" (the AAP-cited page — trust magnet).

## 7. Risks

- Playback engineering is the product — hence the absolute phase-1 gate; a single audible seam
  or a blocked morning alarm is a one-star review generator.
- Audio provenance shortcuts would be existential (a licensing claim against a sleep app kills
  it) — the documented chain is non-negotiable.
- Head-term ASO is dominated by subscription giants with ad budgets — expected; the plan wins
  on long-tail queries, community channels, and the review velocity that "actually free, no
  catch" generates. Judge on retention and rating, not launch-month installs.
