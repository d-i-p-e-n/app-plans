# App Kit (binding for every app)

`@intellidip/app-kit` is the shared Expo/React Native scaffolding every app in this portfolio
builds on: theme mechanism, in-app text scaling, splash gate, developer brand mark, About/Privacy
screen, Firebase Analytics + Crashlytics wiring, the entitlements seam, and pure ads/purchases
configuration.

This document is binding alongside [00-shared-standards.md](00-shared-standards.md) and
[01-growth-playbook.md](01-growth-playbook.md). Where an individual app plan describes building
any of the surfaces below from scratch, **this document supersedes it** — use the kit.

The kit is extracted from the Options Pricing Suite (`C:\dev\OptionPricer`), where every surface
below is already shipping. It is proven code, not a greenfield design.

---

## 1. The one rule

> **The kit holds mechanism. The app holds values.**

The kit never contains a colour, URL, copy string, ad unit ID, storage key, event name, API key,
or `process.env` read. Every one of those is resolved by the app and passed in as a plain value.

This is what makes one package serve 17 repos. When you are unsure whether something belongs in
the kit, ask: *would a second, unrelated app want a different value here?* If yes, it is a prop.

---

## 2. Distribution

### 2.1 Source of truth

`@intellidip/app-kit` lives in its own repo, `intellidip/app-kit`. It is **not** a workspace
package inside any app repo. Consuming repos — including the Options Pricing Suite — depend on
the published package.

```text
intellidip/app-kit/
  src/
    text-scale/     theme/       splash/      brand-mark/
    about/          analytics/   crashlytics/ ads/
    purchases/      entitlements/
    index.ts
  __mocks__/                     manual mocks the kit's own tests need
  package.json  tsconfig.json  jest.config.cjs  jest.setup.js  eslint.config.js
  CHANGELOG.md
```

### 2.2 Publishing (GitHub Packages)

The kit publishes to GitHub Packages as a private scoped package.

In the kit repo's `package.json`:

```json
{
  "name": "@intellidip/app-kit",
  "publishConfig": { "registry": "https://npm.pkg.github.com" }
}
```

Publish from CI on a tagged release, never by hand from a laptop:

```yaml
# .github/workflows/publish.yml  (triggered on tags matching v*)
- uses: actions/setup-node@v4
  with:
    node-version: 22
    registry-url: https://npm.pkg.github.com
    scope: '@intellidip'
- run: npm ci
- run: npm test && npm run typecheck && npm run lint
- run: npm publish
  env:
    NODE_AUTH_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

### 2.3 Consuming

Every consuming repo commits an `.npmrc` at its root:

```ini
@intellidip:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

`NODE_AUTH_TOKEN` is a **classic** PAT with `read:packages` (fine-grained tokens are not reliably
supported by `npm.pkg.github.com` and fail as an opaque 401), set as an environment variable locally
and as a repo secret in CI. **Never commit the token itself** — the `${NODE_AUTH_TOKEN}`
indirection above is what makes the committed `.npmrc` safe.

A repo owned by the *same* account as the package can skip the PAT in CI and use the built-in
`GITHUB_TOKEN` with `permissions: packages: read`. A repo under a different owner cannot: GitHub's
per-package repository-access setting only lists repos under the package's own owner, so a PAT
secret is required there.

Consuming repos add the dependency at the app level, not the repo root:

```json
{ "dependencies": { "@intellidip/app-kit": "^1.2.0" } }
```

EAS Build needs the token too, in **every** environment its `eas.json` profiles build under:

```powershell
eas env:create --scope project --name NODE_AUTH_TOKEN --value <PAT> --visibility secret --environment development
eas env:create --scope project --name NODE_AUTH_TOKEN --value <PAT> --visibility secret --environment preview
eas env:create --scope project --name NODE_AUTH_TOKEN --value <PAT> --visibility secret --environment production
```

(`eas secret:create` is the legacy form; do not use it.)

**If the registry is unreachable during a build, stop and report it.** Do not vendor a copy of the
kit into a consuming repo as a workaround — a local copy immediately drifts and there is no
version history to reconcile it later.

### 2.4 Versioning and rollout

- The kit follows **semver strictly**. A changed prop type, a removed export, or a behavioural
  change a consumer's test could detect is a **major**.
- Every change lands in the **Options Pricing Suite first** and must pass its full suite
  (`npm test`, `npm run typecheck`, `npm run lint` at the root) before the kit is published.
  OptionPricer is the canary: it is the only app with real users and the deepest test coverage.
- Consuming repos take caret ranges (`^1.2.0`) and upgrade on their own schedule. They are never
  required to upgrade in lockstep.
- Every release gets a `CHANGELOG.md` entry. For a major, the entry must state the migration in
  concrete terms ("`lottieSource` now accepts `undefined`; hosts must resolve it through a
  platform-specific module").

---

## 3. Changes to 00-shared-standards.md

This document changes three things in the shared standards. Those sections have been updated in
place; the rationale is recorded here.

| Standard | Was | Now |
|---|---|---|
| §2 Tech stack, UI | "a small shared `packages/ui` design-tokens module per repo" | `@intellidip/app-kit` supplies the token contracts and primitives. **`packages/ui` is retired** — do not create it. |
| §3 Monorepo layout | `packages/ui/` and `packages/entitlements/` listed per repo | Both removed. The kit provides them. |
| §6 Entitlements seam | "Every repo has `packages/entitlements`" | The seam ships in the kit as `@intellidip/app-kit`'s entitlements module. Apps extend the `Feature` union with their own Pro features. |

Everything else in the shared standards stands unchanged. In particular §3's rule that **domain
packages stay dependency-free** is unaffected — the kit is a UI/platform package and domain
packages must never import it.

---

## 4. API surface (v1)

Everything below exists and is tested today. Import from the package root:
`import { createTheme, SplashGate } from '@intellidip/app-kit';`

### 4.1 Theme

```ts
Palette                                    // the contract every app's palettes must satisfy
typography                                 // platform-resolved mono family + tabular figures
createTheme({ light, dark, activeScheme }) // -> { getPalette(isDark), usePalette() }
```

The app defines both palette objects and calls `createTheme` once, conventionally in
`src/theme.ts`, re-exporting `getPalette`/`usePalette`. `activeScheme` is explicit (`'dark'` for a
dark-only app) rather than read from the OS, so both palettes stay defined and testable without a
live toggle.

### 4.2 Text scale

```ts
TEXT_SCALE_MIN | MAX | STEP | DEFAULT
useTextScale(storageKey)                   // hook; storage key is app-supplied
TextScaleProvider ({ storageKey, children })
useTextScaleContext()                      // -> { scale, setScale, increase, decrease }
ScaledText                                 // drop-in RN <Text> honouring the in-app scale
```

**Accessibility note that contradicts §8.8 if you read it carelessly.** `ScaledText` sets
`allowFontScaling={false}` and *replaces* OS text scaling with the in-app control rather than
compounding with it. §8.8's "support OS font scaling to 200% without clipped text" is satisfied by
shipping the in-app control and testing layouts at `TEXT_SCALE_MAX`. An app that uses `ScaledText`
must expose the text-size control in its UI — otherwise it has removed OS scaling and replaced it
with nothing, which fails accessibility review.

### 4.3 Splash gate

```ts
SplashGate ({ children, lottieSource, backgroundColor,
              skipAccessibilityLabel, fallbackTimeoutMs, reducedMotionHoldMs? })
useSplashComplete()                        // boolean, for gating first-run work
resetSplashSessionForTests()
```

Handles once-per-session gating, native splash hiding, tap-to-skip, and reduced-motion. Ships a
`.web` variant that completes immediately.

`fallbackTimeoutMs` is a prop, not a kit constant, because it depends on *your* artwork's length.
Derive it from the asset and keep it at or above the animation duration:

```powershell
node -e "const a=require('./assets/brand/splash.json');console.log(((a.op-a.ip)/a.fr)*1000)"
```

### 4.4 Brand mark

```ts
BrandMarkButton ({ icon, url, hidden, copy, onOpen? })
BrandMarkButtonCopy = { accessibilityLabel, confirmTitle, confirmMessage, cancelLabel, openLabel }
```

Confirms before leaving the app. The app supplies the SVG mark, the URL, a resolved `hidden`
boolean, all five strings, and an `onOpen` callback for analytics.

Portfolio default for `url` is the intellidip developer site; an app overrides it only if it has
its own landing page. Keep the mark itself app-side — it is an SVG component, not a kit asset.

### 4.5 About / Privacy screen

```ts
AboutScreen ({ palette, appName, appVersion, disclaimer,
               privacyUrl, websiteUrl, showPrivacyLink, showWebsiteLink, children? })
```

`children` renders between the disclaimer and the link rows — this is where the Remove-Ads row
goes. `show*Link` are resolved booleans, so what counts as an unset URL stays app policy.

### 4.6 Analytics

```ts
AnalyticsEventLike                         // { name: string; params: Record<string, unknown> }
AnalyticsProvider<TEvent extends AnalyticsEventLike>
AnalyticsConsent
createAnalyticsFacade<TEvent>()            // -> { track, trackScreen, setEnabled,
                                           //      setConsent, setProviderForTests }
getFirebaseProvider<TEvent>() | resetFirebaseProviderForTests()
claimOnce(storageKey) | resetClaimOnceForTests(storageKey?)
```

The app owns its `AnalyticsEvent` discriminated union (in `src/analytics/events.ts`) and wraps the
facade in `src/analytics/index.ts`. Event names and per-event dedup policy are app concerns; the
kit supplies only the routing and the `claimOnce` mechanism.

`claimOnce` caches a successful claim **for the process lifetime**, so a second sequential claim
resolves `true` again until restart. This is deliberate, documented behaviour inherited from the
original implementation — do not "fix" it without a plan that says to.

Provider failures never reach the caller; a missing Firebase falls back to a dev logger.

### 4.7 Crashlytics

```ts
recordError(error, context?)  setCrashlyticsCollectionEnabled(enabled)
isCrashlyticsLinked()         isCrashlyticsCollectionEnabled()
triggerTestCrash()            resetCrashlyticsProviderForTests()
installGlobalErrorHandler()   resetGlobalErrorHandlerForTests()
```

Call `installGlobalErrorHandler()` once at module scope in `app/_layout.tsx`. The provider never
`require`s the Crashlytics module unless the native module is confirmed present — importing it
blind throws on an unlinked build in a way `try/catch` cannot contain.

Never pass user content as `context`.

### 4.8 Ads and purchases config

```ts
getBannerAdUnitId({ isNonProduction, platform, adUnits, testAdUnitId })
getAdsConsentDebugOptions({ isDev, debugGeography, testDeviceId, eeaDebugGeographyValue })
isPurchasesConfigured(platform, apiKey)
getApiKey(platform, iosKey?, androidKey?)
```

**The kit does not depend on `react-native-google-mobile-ads`.** SDK runtime values
(`TestIds.ADAPTIVE_BANNER`, `AdsConsentDebugGeography.EEA`) are passed in as already-resolved
arguments, so an app that omits the SDK can still import the rest of the kit safely.

Platform narrowing at the call site, preserving "iOS vs. everything else":

```ts
platform: Platform.OS === 'ios' ? 'ios' : 'android'
```

`isPurchasesConfigured` is the exception — it takes the **raw, un-narrowed** `Platform.OS`,
because its `!== 'web'` check needs the real value. Narrowing first folds `'web'` into `'android'`
and wrongly enables purchases on web.

### 4.9 Entitlements

```ts
Feature                                    // extensible union; 'no-ads' | 'core' | app features
NO_ADS_FEATURE                             // the single named source of truth for 'no-ads'
hasFeature(feature)  setEntitlement(feature, isActive)
subscribeEntitlements(listener)  resetEntitlementsForTests()
```

Every feature check in app code goes through `hasFeature()` from day one, per §6. Import
`NO_ADS_FEATURE` rather than writing the `'no-ads'` literal.

---

## 5. Wiring the kit into a new app

Follow in order. Each step has a check; do not proceed past a failing check.

**1. Registry access.** Commit the root `.npmrc` from §2.3, export `NODE_AUTH_TOKEN`, add the EAS
secret.
*Check:* `npm view @intellidip/app-kit version` prints a version.

**2. Install.** Add `@intellidip/app-kit` to the app's `dependencies`, then `npm install` at the
repo root.
*Check:* `npm ls @intellidip/app-kit` resolves.

**3. Peer dependencies.** The kit declares these as peers; the app must have them at compatible
versions. `react`, `react-native`, `@react-native-async-storage/async-storage`,
`expo-splash-screen`, `lottie-react-native`, `expo-linking`, `react-native-safe-area-context`.
The three `@react-native-firebase/*` peers are **optional** — omit them for an app that ships no
analytics, and the kit degrades to its dev logger.
*Check:* `npm install` produces no unmet-peer warnings.

**4. `src/app-kit.config.ts`.** One file per app collecting the values the kit needs. Start from
OptionPricer's and adapt:

```ts
export { PRIVACY_POLICY_URL, DEVELOPER_WEBSITE_URL, isPlaceholderUrl } from '@/content/links';
export { DISCLAIMER_TEXT } from '@/content/disclaimer';

export const TEXT_SCALE_STORAGE_KEY = 'settings:textScale';
```

Only re-export from modules with **no import-time side effects**. Re-exporting a value from a
module that statically imports a native SDK drags that SDK into the import graph of everything
reading this file. (`AD_UNITS` is excluded for exactly this reason — it lives in `ads/config.ts`,
which imports the Google Mobile Ads SDK at module level.)

**5. Theme.** Define both palettes in `src/theme.ts`, call `createTheme`, re-export
`getPalette`/`usePalette`.
*Check:* a contrast test over both palettes passes (copy OptionPricer's `theme.test.ts`).

**6. Root layout.** In `app/_layout.tsx`: call `installGlobalErrorHandler()` at module scope, and
mount `<TextScaleProvider storageKey={TEXT_SCALE_STORAGE_KEY}>` wrapping `<SplashGate …>`.

**7. Splash artwork.** Create the platform pair described in §6 below. Do **not** `require` the
Lottie JSON from platform-neutral code.

**8. Analytics.** Define `src/analytics/events.ts`, wrap the facade in `src/analytics/index.ts`,
preserving the export names `track`, `trackScreen`, `setAnalyticsEnabled`, `setAnalyticsConsent`,
`setAnalyticsProviderForTests`.

**9. Ads, purchases, entitlements.** App-side `ads/config.ts` and `purchases/config.ts` keep every
`EXPO_PUBLIC_*` read and the SDK import, delegating logic to the kit.

**10. About screen.** Thin adapter passing resolved values, with the Remove-Ads row as `children`.

*Final check:* `npm test`, `npm run typecheck`, `npm run lint` all exit 0 at the repo root, and
`npx expo export --platform android` completes.

---

## 6. Rules and invariants

These are enforceable in review. Violating one is a bug even if tests pass.

1. **No app values in the kit.** No colour, URL, copy string, ad unit, storage key, event name, or
   `process.env` read. If a PR to the kit adds one, it belongs in a prop.
2. **No `process.env.EXPO_PUBLIC_*` anywhere in the kit.** Expo inlines these at build time; a
   value read inside the kit would bake one app's config into every consumer.
3. **`__DEV__`** is permitted in the kit's analytics and crashlytics modules (matching their live
   behaviour) and prohibited in ads and purchases, which are a deliberately pure design.
4. **Never `require` a native-only asset from platform-neutral code.** Metro inlines a required
   JSON asset's *contents* wherever the require is reachable, so a require in a shared file embeds
   the asset in every platform's bundle. Use a platform module pair:

   ```ts
   // splash-source.ts          -> export const SPLASH_SOURCE = require('…/splash.json');
   // splash-source.web.ts      -> export const SPLASH_SOURCE = undefined;
   ```

   **Verify by asset *content*, never by filename** — Metro drops the path, so grepping a bundle
   for the filename returns zero matches whether or not the asset is embedded, a check that
   silently always passes:

   ```powershell
   npx expo export --platform web --output-dir "$env:TEMP\web" --clear
   Select-String -Path "$env:TEMP\web\_expo\static\js\web\*.js" -Pattern '<a string from inside the JSON>' -List
   ```

5. **Prefer a compatibility shim over editing every caller.** When moving a module that many files
   import, leave a one-line re-export at the original path rather than rewriting N imports. If a
   shim ever needs more than a re-export, the kit's export surface is missing something — fix the
   kit, not the shim.
6. **Domain packages never import the kit.** Per §3 they stay dependency-free.
7. **Kit code must typecheck under the strict base config** — `strict`,
   `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `noImplicitOverride`,
   `noImplicitReturns`.

---

## 7. Testing the kit

The kit's own suite uses `jest-expo` (not `ts-jest`) because it renders React Native components.

Manual mocks under the kit's `__mocks__/` must be **inside the kit repo** — Jest resolves manual
mocks from its own root, so a consuming app's `__mocks__/` does not serve the kit's tests. The kit
carries mocks for `lottie-react-native` and the three `@react-native-firebase` modules.

Kit tests must use **deliberately non-brand values** — marker palettes like `#f00001`, ad units
like `unit/ios`, copy like `Test brand`. A kit test containing a real intellidip colour or URL is
itself evidence that a value leaked into the kit.

Consuming apps should keep an integration test that exercises the kit through their own adapter.
When such a test passes **unmodified** across a kit upgrade, that is the strongest available
evidence the upgrade preserved behaviour.

---

## 8. Not in the kit yet

Do not assume these exist. An app needing one builds it app-side; a second app needing the same
thing is the trigger to propose extracting it.

| Surface | Status |
|---|---|
| UMP ads consent flow (`consent-context`, consent gathering) | App-side. Genuinely coupled to the SDK; needs a dependency-injection design before extraction. |
| Anchored banner component | App-side. Couples consent + entitlement + purchases + theme. |
| `expo-notifications` wrapper | Not started. Required by quiet-alerts and life-admin; likely the next extraction. |
| Disclaimer modal / first-run gate | App-side in OptionPricer. Good extraction candidate. |
| Settings screen shell | App-side. |
| `expo-sqlite` DAO conventions | Not started. Per §2 these stay app-side under `src/db/`. |
| Spacing scale | Not in `typography`. Apps define their own for now. |

---

## 9. Migration status — done

`@intellidip/app-kit@1.0.0` was published on 2026-08-02 from `github.com/intellidip/app-kit`, and
the Options Pricing Suite consumes it from GitHub Packages. `packages/app-kit` and
`packages/entitlements` no longer exist in that repo. The full procedure and its verification gates
are recorded in `OptionPricer/plans/052-app-kit-standalone-repo.md`.

Four things learned in execution that apply to every future consumer:

1. **`moduleResolution: Node16` does not work for this package.** It resolves
   `@react-native-firebase/*` through their `exports` maps as ESM, so `typeof import(...)` from a
   CommonJS file fails with `TS1542`. The build uses `module: "CommonJS"` +
   `moduleResolution: "node10"`, which needs `"ignoreDeprecations": "6.0"` under TypeScript 6 —
   **revisit before TypeScript 7**.
2. **`npm install` will not re-resolve a `file:` dependency** to the registry if the installed
   version already satisfies the new range. Changing `file:…tgz` to `^1.0.0` and reinstalling
   silently keeps the tarball path in the lockfile, which then fails on any other machine. Force it
   with `npm uninstall` then `npm install <pkg>@<range>`, and assert the lockfile's `resolved` URL
   rather than trusting `npm ls`.
3. **A rename must also search the escaped form.** A regex literal containing `'@pricer\/app-kit'`
   is not matched by a plain `@pricer/app-kit` search.
4. **Verify platform variants by asset content, not filename.** Metro drops the path, so grepping a
   bundle for the asset filename returns nothing whether or not it is embedded. Comparing a string
   from *inside* the Lottie JSON across the android and web bundles is what actually proves
   `.web.js` resolution works from compiled `dist/`.

Device QA for the switchover follows `C:\dev\OptionPricer\HOWTO.md` section 11 — in particular
§11c, testing persisted state across an *upgrade* rather than a fresh install. That QA is still
outstanding, as is plan 051's.
