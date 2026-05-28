# keeptidy — repo guide

Chrome MV3 extension that periodically cleans data for dormant sites
(domains with no visits within a configurable threshold). Two surfaces
— popup and full settings page — backed by a service worker.

## Architectural rules

- **Presentational components are pure.** Anything in `src/components/`,
  `src/popup/Popup.tsx`, `src/options/Options.tsx` and its sub-panels
  must never call `chrome.*`. They take all data as props. This is what
  lets `remotion/PopupDemo.tsx` and `remotion/OptionsDemo.tsx` mount
  the same components with mock props for video generation.
- **Containers wire chrome APIs.** `PopupContainer` and
  `OptionsContainer` are the only React files that read/write
  `chrome.storage`, query `chrome.history`, or send messages to the
  service worker.
- **The service worker is authoritative for sweeps.** Don't run
  destructive operations from popup/options directly — send a message
  (`tidy-now`, `erase-all`) and let `src/background/service-worker.ts`
  call `runSweep` or `eraseAllBrowsingData`.

## Sweep semantics (don't change without discussion)

The "tidy dormant sites" model:

- An **inactive domain** = no entry in `chrome.history` within the
  threshold window. Exempt list (`*.notion.so` wildcards supported)
  protects domains from this classification.
- **Per-entry trimming** for history (`chrome.history.deleteRange`)
  and downloads (`chrome.downloads.erase`) — old entries get cleaned
  regardless of whether the domain is still active.
- **Per-domain wipe** for cookies, localStorage, IndexedDB,
  serviceWorkers, cacheStorage — only for inactive non-exempt domains
  via `chrome.browsingData.remove({ origins: [...] }, ...)`.
- There is **no per-domain targeting** for one-off cleans. The only
  domain-aware mechanism is the exempt list. If you see logic that
  looks like "clean youtube.com only", that's wrong.

## Frequency model

Auto-tidy runs on `chrome.alarms` with `periodInMinutes` (not
wall-clock). The browser fires the alarm whenever it's open and the
period has elapsed since the last fire. Frequencies: `manual`,
`hourly`, `6h`, `24h`. See `src/lib/alarms.ts`.

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
  components/ shared atoms (Wordmark, StatusPill, Switch, ThresholdPills)
  background/ service worker
  lib/        pure logic — types, sweep, history, browsingData, …
  styles/     tokens.css + reset.css
remotion/     compositions that reuse the surface components
design/       reference HTML mockups + logo.svg (brand source)
public/icons/ rasterized PNGs (built from design/logo.svg)
tests/        unit/ (vitest) + e2e/ (Playwright)
```
