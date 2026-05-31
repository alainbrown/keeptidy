# keeptidy — repo guide

Chrome MV3 extension that periodically cleans data for dormant sites
(domains with no visits within a configurable threshold). Two surfaces
— popup and full settings page — backed by a service worker.

## Architectural rules

- **Presentational components are pure.** Anything in `src/components/`,
  `src/popup/Popup.tsx`, `src/options/Options.tsx` and its sub-panels
  must never call `chrome.*`. They take all data as props. This is what
  lets `remotion/Demo.tsx` (plus the per-still screenshot compositions)
  mount the same components with mock props to render the demo video,
  GIF, and Chrome Web Store assets.
- **Containers wire chrome APIs.** `PopupContainer` and
  `OptionsContainer` are the only React files that read/write
  `chrome.storage`, query `chrome.history`, or send messages to the
  service worker.
- **The service worker is authoritative for sweeps.** Don't run
  destructive operations from popup/options directly — send a message
  (`tidy-now`, `erase-all`) and let `src/background/service-worker.ts`
  call `runSweep` or `eraseAllBrowsingData`.

## Sweep semantics (don't change without discussion)

The model uses **two clocks**, split by what Chrome lets us read. Both
read the same `thresholdMs` value (default 60 days) and both honor the
exempt list (`*.notion.so` wildcards supported); they differ only in
granularity, because site-data has no per-record age the API exposes.

- **Cookies + site data → per dormant domain.** localStorage,
  IndexedDB, serviceWorkers, cacheStorage, and cookies carry no
  per-record timestamp an extension can read, and
  `chrome.browsingData.remove` filters only by `origins` or by a `since`
  floor. So the only age signal available is the **domain's** last
  visit. An **inactive domain** = no entry in `chrome.history` within
  the threshold window (`partitionByThreshold`). We wipe site data for
  inactive non-exempt domains via
  `chrome.browsingData.remove({ origins: [...] }, ...)`. Recent activity
  on a domain protects all of its site data.
- **History + downloads → per entry age.** These *do* carry per-entry
  timestamps, so they are cleaned by each entry's own age: anything
  older than `thresholdMs` is removed even if its domain is still
  active (`deleteOldHistory` / `deleteOldDownloads`, exempt-protected).
  This is the behavior a "keep 60 days" threshold implies — an old
  download doesn't linger just because you still visit the site. We
  iterate per entry (`chrome.history.deleteUrl` per URL;
  `chrome.downloads.erase`) rather than the cheaper `deleteRange`/range
  query precisely so we can skip exempt domains. Age subsumes dormancy
  for history (a dormant domain's newest visit is already past the
  cutoff), so this pass also covers everything the per-domain pass
  would have removed.
- There is **no per-domain targeting** for one-off cleans. The only
  domain-aware mechanism is the exempt list. If you see logic that
  looks like "clean youtube.com only", that's wrong.

## Frequency model

Auto-tidy runs on `chrome.alarms` with `periodInMinutes` (not
wall-clock). The browser fires the alarm whenever it's open and the
period has elapsed since the last fire. Frequencies: `manual`,
`hourly` (default), `6h`, `24h`. See `src/lib/alarms.ts`.

The alarm's **initial** fire is decoupled from the period: it's a small
fixed `STARTUP_DELAY_MINUTES` (~4 min), so each preset really means
"≈4 min after launch, then every N." This is deliberate.
`reconcileAlarm` runs on every `onStartup` (and every settings change)
and clears+recreates the alarm; if the initial delay equalled the
period, users whose sessions are shorter than the period — and who
restart before it elapsed — would reset the countdown every launch and
never get an auto-sweep. The short startup delay guarantees a sweep
each session (and means fresh installs tidy ~4 min in, not a period
later).

## Categories

Settings include a `categories` flag set (`history`, `downloads`,
`cookies`, `siteData`) that gates which steps of `runSweep` execute.
All-true is the default. The history/downloads passes are skipped if
their flag is off; the `chrome.browsingData.remove` call only includes
the cookie/site-data data types whose flags are on (and is a no-op if
both are off). See `src/lib/sweep.ts`.

## In-flight feedback

The service worker writes an `inFlight` record to `chrome.storage.local`
at sweep start and clears it in a `finally` block. The `useInFlight`
hook subscribes both surfaces to it so the popup's button disables +
flips to "Tidying…" and the settings top-bar shows a pulsing "tidying
now" pill — and crucially these states survive the popup closing
mid-run (Chrome closes the popup whenever it loses focus).

## Dark mode

`tokens.css` has a `@media (prefers-color-scheme: dark)` block that
flips the design tokens. The brand identity (lime accent + Funnel
typography) stays universal; only the surface palette inverts. A
semantic `--surface-raised` variable stays dark in both themes for
elevated affordances (primary button, pill-on, switch-on, badge),
because letting it flip would invert affordance reads. SVG inline
colors in the timeline visualizations use `style={{ stroke: 'var(--ink)' }}`
to pick up the variable across themes.

## Design tokens

`src/styles/tokens.css` is the single source of truth for the
graphite + lime palette and the three Funnel/JetBrains font families
(loaded via Google Fonts `@import`). Component CSS should reference
the variables (`var(--ink)`, `var(--lime)`, etc.) — don't hard-code
colors. The mockups in `design/` are the design reference; the React
components are 1:1 ports. The brand mark lives at `design/logo.svg`
and is rasterized to `public/icons/{16,32,48,128}.png` by
`npm run icons`.

## Commands

- `npm run dev` — Vite dev server with HMR. Load `dist/` in
  `chrome://extensions` → Load unpacked.
- `npm run build` — `tsc --noEmit` + Vite production build.
- `npm run test:unit` — Vitest (pure lib code).
- `npm run test:e2e` — Builds, then Playwright loads the unpacked
  extension into Chromium. **First run requires
  `npx playwright install chromium`.**
- `npm run remotion:studio` — Remotion preview of the demo
  compositions.

## Conventions

- Threshold stored as `thresholdMs: number` (canonical). Pills/presets
  derive from it via `msToPreset` in `src/lib/presets.ts`. Drag
  produces arbitrary values; UI snaps to the nearest preset within
  ~8% log-distance.
- Settings → `chrome.storage.sync`. Run log → `chrome.storage.local`
  (capped at 50 entries).
- Message types between popup/options and service worker live in
  `src/lib/messaging.ts`. Add new ones there, not inline.

## What lives where

```
src/
  popup/      surface 1 — 380px window
  options/    surface 2 — full page
  components/ shared atoms (Wordmark, StatusPill, Switch, Checkbox,
              ThresholdPills)
  background/ service worker
  lib/        pure logic — types, sweep, history, browsingData,
              alarms, format, presets, chromeStorage, messaging
  styles/     tokens.css + reset.css
remotion/     Demo composition + screenshots/store stills, Dockerfile,
              render scripts — fully self-contained subsystem
design/       reference HTML mockups + logo.svg (brand source)
public/icons/ rasterized PNGs (built from design/logo.svg)
docs/         rendered outputs (demo.mp4, demo.gif, store/*) —
              committed because GitHub serves the GIF in the README
tests/        unit/ (vitest) + e2e/ (Playwright)
```
