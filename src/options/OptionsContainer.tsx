import { useCallback, useEffect, useState } from 'react';
import type { DomainBucket, Settings } from '../lib/types';
import { useInFlight, useRuns, useSettings } from '../lib/useChromeStorage';
import {
  bucketDomains,
  getAllDomainsWithLastVisit,
  partitionByThreshold,
} from '../lib/history';
import { nextAlarmAt } from '../lib/alarms';
import { formatDateDots, formatIn } from '../lib/format';
import { Options } from './Options';

export function OptionsContainer() {
  const [settings, updateSetting] = useSettings();
  const runs = useRuns();
  const inFlight = useInFlight();
  const [pendingCount, setPendingCount] = useState(0);
  const [keptCount, setKeptCount] = useState(0);
  const [buckets, setBuckets] = useState<DomainBucket[]>([]);
  const [nextAt, setNextAt] = useState<number | null>(null);
  const [saved, setSaved] = useState(true);

  const thresholdMs = settings?.thresholdMs;
  const exemptKey = settings?.exemptDomains.join(',');
  const lastRunTs = runs[0]?.ts;

  useEffect(() => {
    if (!settings) return;
    let alive = true;
    (async () => {
      const domains = await getAllDomainsWithLastVisit();
      if (!alive) return;
      const { inactive, active, exempt } = partitionByThreshold(
        domains,
        settings.thresholdMs,
        settings.exemptDomains,
      );
      setPendingCount(inactive.length);
      setKeptCount(active.length + exempt.length);
      setBuckets(bucketDomains(domains));
    })();
    return () => {
      alive = false;
    };
  }, [thresholdMs, exemptKey, lastRunTs]);

  useEffect(() => {
    let alive = true;
    const refresh = () => nextAlarmAt().then((t) => alive && setNextAt(t));
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [settings?.autoTidy, settings?.frequency]);

  const onSettingChange = useCallback(
    <K extends keyof Settings>(k: K, v: Settings[K]) => {
      setSaved(false);
      updateSetting(k, v).then(() => setSaved(true));
    },
    [updateSetting],
  );

  const onAddExempt = useCallback(
    (pattern: string) => {
      if (!settings) return;
      const trimmed = pattern.trim();
      if (!trimmed || settings.exemptDomains.includes(trimmed)) return;
      onSettingChange('exemptDomains', [...settings.exemptDomains, trimmed]);
    },
    [settings, onSettingChange],
  );

  const onRemoveExempt = useCallback(
    (pattern: string) => {
      if (!settings) return;
      onSettingChange(
        'exemptDomains',
        settings.exemptDomains.filter((p) => p !== pattern),
      );
    },
    [settings, onSettingChange],
  );

  const onTidyNow = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'tidy-now' });
  }, []);

  const onEraseAll = useCallback(() => {
    const ok = window.confirm(
      'Erase all browsing data? Bookmarks and passwords are untouched. This cannot be undone.',
    );
    if (!ok) return;
    chrome.runtime.sendMessage({ type: 'erase-all' });
  }, []);

  if (!settings) return null;

  return (
    <Options
      settings={settings}
      vm={{
        pendingCount,
        keptCount,
        domainBuckets: buckets,
        runs,
        tidying: inFlight !== null,
        nextInLabel: settings.autoTidy && nextAt ? formatIn(nextAt) : null,
        today: formatDateDots(),
        saved,
        build: 'graphite · 4d',
      }}
      onSettingChange={onSettingChange}
      onAddExempt={onAddExempt}
      onRemoveExempt={onRemoveExempt}
      onTidyNow={onTidyNow}
      onEraseAll={onEraseAll}
    />
  );
}
