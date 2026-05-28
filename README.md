# keeptidy

A Chrome extension that periodically cleans browsing data for sites
you've stopped using — history, cookies, local storage, IndexedDB,
service workers, and cache — while leaving bookmarks and passwords
untouched.

## What it does

Once a domain hasn't appeared in your history within the configured
threshold, keeptidy classifies it as **dormant** and wipes its
site-attached data on the next sweep. History and download entries
older than the threshold are trimmed per-entry across all domains.

- **Threshold** — drag-to-set on a log-scale timeline, or pick a
  preset (1 day → 1 year).
- **Frequency** — manual, hourly, every 6 hours, every 24 hours.
  Browser-uptime based, not wall-clock.
- **Exempt list** — wildcard-aware patterns like `*.notion.so` or
  `localhost`.
- **Erase everything** — one-shot full wipe, still leaves bookmarks
  and passwords alone.

## Quick start

```sh
npm install
npm run build
```

Then in Chrome: `chrome://extensions` → enable Developer mode →
*Load unpacked* → select `dist/`.

For development with HMR:

```sh
npm run dev
```

## Stack

- React 18 + TypeScript
- Vite 5 + [@crxjs/vite-plugin](https://crxjs.dev/) for MV3 bundling
- Plain CSS with design tokens — no UI framework
- [Remotion](https://www.remotion.dev) for programmatic demo videos
- Vitest + Playwright for tests

## Project structure

```
src/
  popup/              # 380px popup window
  options/            # Full settings page
  components/         # Shared atoms
  background/         # Service worker (sweep scheduling)
  lib/                # Pure logic — sweep, history, browsingData, alarms
  styles/             # tokens.css + reset.css
remotion/             # Demo compositions reusing the surface components
design/               # HTML mockups + logo.svg (brand source)
public/icons/         # Rasterized PNGs (npm run icons → from design/logo.svg)
tests/
  unit/               # Vitest — pure lib coverage
  e2e/                # Playwright — extension journeys against built dist/
```

The surfaces are built with a strict container / pure-component split:
`Popup.tsx` and `Options.tsx` take all data via props, so the Remotion
side mounts the same UI with mock props for video generation.

## Testing

```sh
npm run test:unit       # ~250ms
npm run test:e2e        # Builds, then runs Playwright (~5s)
npm test                # Both
```

First-time E2E setup:

```sh
npx playwright install chromium
```

The E2E suite launches a fresh Chromium profile with `dist/` loaded
as an unpacked extension. Two journeys:

1. **Settings UI** — change a preset, add an exempt domain, reload
   and verify persistence.
2. **Sweep** — seed history, let it age past a 2-second threshold,
   trigger `tidy-now` via the service worker, and verify only the
   intended entries are gone.

## Remotion demos

```sh
npm run remotion:studio                  # interactive preview
npm run remotion:render:popup            # → out/popup.mp4
npm run remotion:render:options          # → out/options.mp4
```

## Permissions

`history`, `storage`, `alarms`, `downloads`, `browsingData`, `cookies`.
No host permissions — `browsingData.remove({ origins })` works without
them.
