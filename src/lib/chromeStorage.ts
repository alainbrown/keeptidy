import type { InFlight, Run, Settings } from './types';

const DAY = 24 * 60 * 60 * 1000;

export const SETTINGS_DEFAULTS: Settings = {
  thresholdMs: 60 * DAY,
  frequency: '6h',
  // Anchored on auth/SSO endpoints (where losing the session re-auths a
  // whole ecosystem) plus high-friction work tools. Users can edit
  // freely; this is just a sensible starting set.
  exemptDomains: [
    'localhost',
    '127.0.0.1',
    'github.com',
    '*.notion.so',
    'login.microsoftonline.com',
    '*.slack.com',
    '*.atlassian.net',
    '*.zoom.us',
    '*.figma.com',
    '*.linkedin.com',
    '*.dropbox.com',
    '*.google.com',
  ],
  autoTidy: true,
  categories: {
    history: true,
    downloads: true,
    cookies: true,
    siteData: true,
  },
};

const SETTINGS_KEY = 'settings';
const RUNS_KEY = 'runs';
const RUNS_LIMIT = 50;
const IN_FLIGHT_KEY = 'inFlight';

export async function getSettings(): Promise<Settings> {
  const raw = await chrome.storage.sync.get(SETTINGS_KEY);
  const stored = (raw[SETTINGS_KEY] ?? {}) as Partial<Settings>;
  return {
    ...SETTINGS_DEFAULTS,
    ...stored,
    categories: {
      ...SETTINGS_DEFAULTS.categories,
      ...(stored.categories ?? {}),
    },
  };
}

export async function setSettings(patch: Partial<Settings>): Promise<Settings> {
  const current = await getSettings();
  const next = { ...current, ...patch };
  await chrome.storage.sync.set({ [SETTINGS_KEY]: next });
  return next;
}

export async function getRuns(): Promise<Run[]> {
  const raw = await chrome.storage.local.get(RUNS_KEY);
  return (raw[RUNS_KEY] ?? []) as Run[];
}

export async function appendRun(run: Run): Promise<void> {
  const runs = await getRuns();
  const next = [run, ...runs].slice(0, RUNS_LIMIT);
  await chrome.storage.local.set({ [RUNS_KEY]: next });
}

export async function getInFlight(): Promise<InFlight | null> {
  const raw = await chrome.storage.local.get(IN_FLIGHT_KEY);
  return (raw[IN_FLIGHT_KEY] as InFlight | undefined) ?? null;
}

export async function setInFlight(value: InFlight): Promise<void> {
  await chrome.storage.local.set({ [IN_FLIGHT_KEY]: value });
}

export async function clearInFlight(): Promise<void> {
  await chrome.storage.local.remove(IN_FLIGHT_KEY);
}
