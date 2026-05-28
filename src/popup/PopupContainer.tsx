import { useCallback, useEffect, useState } from 'react';
import type { DomainBucket, ThresholdPreset } from '../lib/types';
import { useInFlight, useRuns, useSettings } from '../lib/useChromeStorage';
import {
  bucketDomains,
  getAllDomainsWithLastVisit,
  partitionByThreshold,
} from '../lib/history';
import {
  formatAgo,
  formatFrequency,
  formatThresholdMs,
} from '../lib/format';
import {
  POPUP_THRESHOLD_PRESETS,
  PRESET_TO_MS,
  msToPreset,
} from '../lib/presets';
import { Popup } from './Popup';

export function PopupContainer() {
  const [settings, updateSetting] = useSettings();
  const runs = useRuns();
  const inFlight = useInFlight();
  const [pendingCount, setPendingCount] = useState(0);
  const [buckets, setBuckets] = useState<DomainBucket[]>([]);

  const thresholdMs = settings?.thresholdMs;
  const exemptKey = settings?.exemptDomains.join(',');
  const lastRunTs = runs[0]?.ts;

  useEffect(() => {
    if (!settings) return;
    let alive = true;
    (async () => {
      const domains = await getAllDomainsWithLastVisit();
      if (!alive) return;
      const { inactive } = partitionByThreshold(
        domains,
        settings.thresholdMs,
        settings.exemptDomains,
      );
      setPendingCount(inactive.length);
      setBuckets(bucketDomains(domains));
    })();
    return () => {
      alive = false;
    };
  }, [thresholdMs, exemptKey, lastRunTs]);

  const onTidyNow = useCallback(() => {
    chrome.runtime.sendMessage({ type: 'tidy-now' });
  }, []);

  const onOpenSettings = useCallback(() => {
    chrome.runtime.openOptionsPage();
  }, []);

  const onChangeThreshold = useCallback(
    (preset: ThresholdPreset) => {
      updateSetting('thresholdMs', PRESET_TO_MS[preset]);
    },
    [updateSetting],
  );

  const onToggleAutoTidy = useCallback(
    (next: boolean) => {
      updateSetting('autoTidy', next);
    },
    [updateSetting],
  );

  if (!settings) return null;

  const lastSweepRun = runs[0];
  const thresholdPresetValue = msToPreset(settings.thresholdMs);

  return (
    <Popup
      pendingCount={pendingCount}
      threshold={{
        ms: settings.thresholdMs,
        label: formatThresholdMs(settings.thresholdMs),
      }}
      frequency={{ label: formatFrequency(settings.frequency) }}
      autoTidy={settings.autoTidy}
      tidying={inFlight !== null}
      lastSweep={
        lastSweepRun
          ? {
              agoLabel: formatAgo(lastSweepRun.ts),
              count: lastSweepRun.inactiveDomains,
            }
          : null
      }
      domainBuckets={buckets}
      thresholdPresetValue={thresholdPresetValue}
      popupPresets={POPUP_THRESHOLD_PRESETS}
      onTidyNow={onTidyNow}
      onChangeThreshold={onChangeThreshold}
      onToggleAutoTidy={onToggleAutoTidy}
      onOpenSettings={onOpenSettings}
    />
  );
}
