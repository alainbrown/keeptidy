# Privacy Policy for keeptidy

_Last updated: 2026-05-28_

keeptidy is a Chrome extension that automatically cleans browsing data
for dormant sites. This policy explains what the extension does and does
not do with your data.

## The short version

**keeptidy does not collect, store, transmit, or sell any of your data.**
Everything it does happens locally inside your own browser. There are no
servers, no analytics, no tracking, and no third parties.

## What the extension accesses, and why

keeptidy uses Chrome APIs purely to do its job on your device:

- **Browsing history** (`history`) — read to identify which domains are
  "dormant" (not visited within your chosen threshold) and to delete
  history entries older than that threshold. History is read and deleted
  locally; it is never transmitted anywhere.
- **Downloads** (`downloads`) — download-list entries older than your
  threshold are erased. Files already saved to your disk are never
  touched.
- **Site data** (`browsingData`) — cookies, local storage, IndexedDB,
  service workers, and cache for dormant, non-exempt domains are cleared
  on your device.
- **Storage** (`storage`) — your settings (threshold, frequency,
  categories, exempt list) and a short run log are saved in Chrome's
  local and sync storage. Sync storage, if enabled in your browser, is
  synchronized by Chrome across your own signed-in devices; keeptidy
  itself never sends this data to anyone.
- **Alarms** (`alarms`) — used only to schedule the recurring cleanup.

## Data sharing

None. keeptidy does not send any data to the developer or to any third
party. It contains no remote code and makes no network requests.

## Bookmarks and passwords

keeptidy never accesses, modifies, or deletes your bookmarks or saved
passwords.

## Open source

keeptidy is open source. You can review exactly what it does at
https://github.com/alainbrown/keeptidy

## Contact

Questions? Open an issue at
https://github.com/alainbrown/keeptidy/issues
