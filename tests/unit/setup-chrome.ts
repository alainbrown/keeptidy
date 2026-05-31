import { vi } from 'vitest';

// Chrome's unit-testing guide recommends stubbing the chrome.* surface the
// code under test touches, with stubs that throw by default so any call a
// test forgot to mock fails loudly instead of silently returning undefined.
// Tests override individual methods with
// `vi.spyOn(chrome.x, 'y').mockResolvedValue(...)`.
// https://developer.chrome.com/docs/extensions/mv3/unit-testing/
const unmocked =
  (name: string) =>
  (): never => {
    throw new Error(`chrome.${name} called without a mock`);
  };

vi.stubGlobal('chrome', {
  history: {
    search: unmocked('history.search'),
    deleteUrl: unmocked('history.deleteUrl'),
  },
  downloads: {
    search: unmocked('downloads.search'),
    erase: unmocked('downloads.erase'),
  },
});
