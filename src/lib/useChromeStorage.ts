import { useCallback, useEffect, useState } from 'react';
import type { InFlight, Run, Settings } from './types';
import {
  getInFlight,
  getRuns,
  getSettings,
  setSettings,
} from './chromeStorage';

export function useSettings() {
  const [settings, setSettingsState] = useState<Settings | null>(null);

  useEffect(() => {
    let mounted = true;
    getSettings().then((s) => {
      if (mounted) setSettingsState(s);
    });
    const handler = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName,
    ) => {
      if (area === 'sync' && changes.settings) {
        setSettingsState(changes.settings.newValue as Settings);
      }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handler);
    };
  }, []);

  const update = useCallback(
    async <K extends keyof Settings>(key: K, value: Settings[K]) => {
      await setSettings({ [key]: value } as Partial<Settings>);
    },
    [],
  );

  return [settings, update] as const;
}

export function useRuns() {
  const [runs, setRunsState] = useState<Run[]>([]);

  useEffect(() => {
    let mounted = true;
    getRuns().then((r) => {
      if (mounted) setRunsState(r);
    });
    const handler = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName,
    ) => {
      if (area === 'local' && changes.runs) {
        setRunsState((changes.runs.newValue ?? []) as Run[]);
      }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handler);
    };
  }, []);

  return runs;
}

export function useInFlight() {
  const [inFlight, setInFlightState] = useState<InFlight | null>(null);

  useEffect(() => {
    let mounted = true;
    getInFlight().then((v) => {
      if (mounted) setInFlightState(v);
    });
    const handler = (
      changes: Record<string, chrome.storage.StorageChange>,
      area: chrome.storage.AreaName,
    ) => {
      if (area === 'local' && changes.inFlight) {
        setInFlightState(
          (changes.inFlight.newValue ?? null) as InFlight | null,
        );
      }
    };
    chrome.storage.onChanged.addListener(handler);
    return () => {
      mounted = false;
      chrome.storage.onChanged.removeListener(handler);
    };
  }, []);

  return inFlight;
}
