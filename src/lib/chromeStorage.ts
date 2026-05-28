import type { Settings, Run } from './types';

const DAY = 24 * 60 * 60 * 1000;

export const SETTINGS_DEFAULTS: Settings = {
  thresholdMs: 60 * DAY,
  frequency: '6h',
  exemptDomains: ['github.com', '*.notion.so', 'mail.google.com', 'localhost'],
  autoTidy: true,
};

const SETTINGS_KEY = 'settings';
const RUNS_KEY = 'runs';
const RUNS_LIMIT = 50;

export async function getSettings(): Promise<Settings> {
  const raw = await chrome.storage.sync.get(SETTINGS_KEY);
  return { ...SETTINGS_DEFAULTS, ...(raw[SETTINGS_KEY] ?? {}) };
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
