# intellidip vector logo system

The master wordmark uses outlined Baskerville letterforms with three amber dots. The dots do double duty as the three lowercase `i` dots and a visual “thinking…” ellipsis.

## Files

- `intellidip-wordmark-dark.svg` — primary full-color logo for dark backgrounds.
- `intellidip-wordmark-light.svg` — full-color logo for light backgrounds; its darker amber preserves contrast.
- `intellidip-wordmark-mono-light.svg` — one-color ivory logo.
- `intellidip-wordmark-mono-dark.svg` — one-color ink logo.
- `intellidip-mark.svg` — transparent compact mark for flexible placement.
- `intellidip-app-icon.svg` — compact mark on the brand’s near-black rounded square.
- `preview.html` — visual contact sheet for reviewing the complete system.
- `logo-system.json` — machine-readable colors and usage measurements.

### Animated

- `intellidip-wordmark-animated-dark.svg` — animated wordmark for dark backgrounds.
- `intellidip-wordmark-animated-light.svg` — animated wordmark for light backgrounds.
- `intellidip-wordmark-animated-mono-light.svg` / `-mono-dark.svg` — single-color animated wordmarks.
- `intellidip-splash-dark.json` / `-light.json` — Lottie splash animation, 1024×1024, 60fps, 3.2s.
- `animation-system.json` — machine-readable choreography (timings, anchor, per-glyph delays).

## Color

| Token | Hex | Use |
| --- | --- | --- |
| Ink | `#0E1017` | Dark field or lettering on light backgrounds |
| Ivory | `#FFF8E7` | Primary lettering on dark backgrounds |
| Amber | `#F3A30F` | Signature dots on dark backgrounds |
| Amber on light | `#B87300` | Signature dots on light backgrounds |

## Usage rules

- Preserve the wordmark’s proportions. Never stretch, condense, rotate, outline, or typeset it again.
- Maintain clear space on every side equal to at least one amber dot diameter.
- Use the full wordmark at widths of `120px`/`32mm` or larger.
- Below that size, use the compact mark. The app-icon version is preferred when the background cannot be controlled.
- Do not recolor individual letters. The three dots are the only amber elements in the primary wordmark.
- Use a monochrome asset when color reproduction or contrast is uncertain.

## The animation

The three dots do their double duty in sequence: first an ellipsis, then the app icon, then the
wordmark.

| Act | Time | What happens |
| --- | --- | --- |
| 1 | 0.00s – 0.82s | The three amber dots pop in left to right, 240ms apart — a "thinking" ellipsis. |
| — | 0.82s – 1.10s | Beat. The ellipsis holds. |
| 2 | 1.10s – 1.52s | The `i` stem extrudes downward out of the **middle** dot. |
| — | 1.52s – 1.80s | Beat. The lockup is now exactly `intellidip-app-icon.svg`. |
| 3 | 1.80s – 2.60s | The camera pulls back, the outer two dots fly to their own `i`s, and the remaining letters fade and rise into place. |
| — | 2.60s → | Holds the finished wordmark. The Lottie adds a 0.6s hold, then ends at 3.2s. |

Two properties are load-bearing, and both are asserted by the build:

- **The anchor never moves.** The middle dot is the `i` of `intell·i·dip`, so the stem that drops in
  act 2 is already in its final position — `intell` grows to its left and `dip` to its right. Nothing
  slides into place afterwards.
- **Act 2 is the app icon, not an approximation.** Dot radius, dot gap and mark height are all held at
  the app icon's exact ratios relative to the `i` stem width, so the lockup reads as the icon at any
  zoom level.

Letter reveal is staggered by each glyph's distance from the anchor, which makes every dot land at
almost exactly the moment its own stem appears — no per-letter hand-tuning. The order falls out as
`l → d → l → i → e → p → t → n → i`, rippling outward.

### One deliberate departure

The camera **pans slightly while it zooms** (about 9% of the frame width) rather than zooming about a
screen-fixed point. This is forced by geometry: the anchor dot sits up and to the right of the
finished wordmark's optical centre, so a zoom about a fixed screen point leaves either the icon stage
or the final wordmark visibly off-centre — badly so on the square splash, where the zoom is 4.2×.
Panning centres both. Nothing moves relative to the letters; only the camera moves. To pin the
anchor to a fixed screen point instead, set the returned `pan` to `{x: 0, y: 0}` in `cameraStart()`
in `tools/build-intellidip-animation.mjs`.

### Timing

Every duration and delay is `calc(var(--id-t) * fraction)`, so one variable rescales the whole
sequence. The files ship at `--id-t: 2.6s`. Inline the SVG (not `<img>`) to override it:

```css
.wordmark-animated svg { --id-t: 1.5s; }
```

2.6s is deliberate on a splash but long for a header logo on every page load; ~1.5s reads better
there. `preview.html` has a live duration slider and scrubber for comparing.

### Reduced motion

The static markup **is** the final frame — the animations only offset away from it. So
`prefers-reduced-motion: reduce` simply switches the animations off and lands exactly on the
finished wordmark — geometrically identical to `intellidip-wordmark-dark.svg`, verified to 0.000px on
every dot position, dot radius and ink bound. This is checked, not assumed.

## Using the animation

### Web

The animated SVGs are self-contained (CSS inside, no JS, no dependencies) and animate normally
inside `<img>`. To swap the header wordmark in `index.html`, point it at the animated file on first
paint and at the static file for later theme changes, so toggling the theme does not replay it:

```js
let played = false;
function updateWordmark(theme) {
  const isDark = theme === 'dark' || (theme !== 'light' && prefersDark.matches);
  const variant = isDark ? 'dark' : 'light';
  wordmarkImg.src = played
    ? `assets/brand/intellidip-wordmark-${variant}.svg`
    : `assets/brand/intellidip-wordmark-animated-${variant}.svg`;
  played = true;
}
```

### Android

Lottie cannot be the Android 12+ system splash — `windowSplashScreenAnimatedIcon` only accepts an
animated vector drawable. The working pattern is to make the system splash a seamless lead-in and
play the Lottie in the first screen:

```xml
<!-- themes.xml -->
<style name="Theme.App.Splash" parent="Theme.SplashScreen">
  <item name="windowSplashScreenBackground">@color/ink</item>          <!-- #0E1017 -->
  <item name="windowSplashScreenAnimatedIcon">@drawable/ic_splash</item>
  <item name="postSplashScreenTheme">@style/Theme.App</item>
</style>
```

```kotlin
// build.gradle.kts:  implementation("com.airbnb.android:lottie:6.4.0")
installSplashScreen()                                  // hands off immediately to our own view
setContentView(binding.root)

binding.splash.setAnimation(R.raw.intellidip_splash_dark)   // res/raw/
binding.splash.addAnimatorListener(object : AnimatorListenerAdapter() {
    override fun onAnimationEnd(animation: Animator) = showHome()
})

// Respect "remove animations" in Accessibility settings by jumping to the final frame.
val animatorScale = Settings.Global.getFloat(
    contentResolver, Settings.Global.ANIMATOR_DURATION_SCALE, 1f
)
if (animatorScale == 0f) {
    binding.splash.progress = 1f
    showHome()
} else {
    binding.splash.playAnimation()
}
```

Give the host view the same `#0E1017` background as `windowSplashScreenBackground` so there is no
flash at the handoff.

### iOS

`LaunchScreen.storyboard` is static, so the same two-stage pattern applies: a launch screen of solid
ink with the centered app icon, then the Lottie in the root view controller.

```swift
// Package: https://github.com/airbnb/lottie-ios (Lottie 4.x)
import Lottie

let splash = LottieAnimationView(name: "intellidip-splash-dark")
splash.contentMode = .scaleAspectFill
splash.backgroundBehavior = .pauseAndRestore
view.addSubview(splash)
splash.frame = view.bounds

if UIAccessibility.isReduceMotionEnabled {
    splash.currentProgress = 1
    showHome()
} else {
    splash.play { _ in self.showHome() }
}
```

Add the two `.json` files to the target's Copy Bundle Resources. Set the launch screen's background
to `#0E1017` to match, and use `-light.json` with `#FFF8E7` if you ship a light launch screen.

## Rebuilding

Run `tools/generate-intellidip-logo.ps1` from the repository root. The script converts the installed
Baskerville face to SVG paths, so the delivered SVGs have no runtime font dependency. It then runs
`tools/build-intellidip-animation.mjs` (Node 18+), which **derives** the animation from the static
wordmark it just wrote — splitting the compound path into its ten glyphs, pairing each `i` with its
tittle, and reading the dot positions and radii straight out of the SVG. Nothing is hand-transcribed,
so the animation cannot drift from the wordmark; change the typeface and the animation follows.

The build hard-fails rather than emitting something subtly wrong if the wordmark stops looking like
it expects — wrong glyph count, a counter with no containing contour, or tittles not landing on
glyphs 0/6/8.
