import type { Run } from './types';
import {
  appendRun,
  clearInFlight,
  getSettings,
  setInFlight,
} from './chromeStorage';
import {
  type DomainLastVisit,
  getAllDomainsWithLastVisit,
  partitionByThreshold,
} from './history';
import {
  clearDomainData,
  deleteOldDownloads,
  deleteOldHistory,
} from './browsingData';

export async function runSweep(trigger: 'auto' | 'manual'): Promise<Run> {
  const startedAt = Date.now();
  const settings = await getSettings();
  const cutoff = startedAt - settings.thresholdMs;

  await setInFlight({ startedAt, trigger });

  try {
    const { categories } = settings;
    const domains = await getAllDomainsWithLastVisit();
    const { inactive } = partitionByThreshold(
      domains,
      settings.thresholdMs,
      settings.exemptDomains,
      startedAt,
    );

    const inactiveDomains = new Set(inactive.map((d) => d.domain));

    const dataToRemove: chrome.browsingData.DataTypeSet = {};
    if (categories.cookies) dataToRemove.cookies = true;
    if (categories.siteData) {
      dataToRemove.cacheStorage = true;
      dataToRemove.indexedDB = true;
      dataToRemove.localStorage = true;
      dataToRemove.serviceWorkers = true;
    }
    await clearDomainData([...inactiveDomains], dataToRemove);

    const deletedHistory = categories.history
      ? await deleteOldHistory(cutoff, settings.exemptDomains)
      : 0;
    const deletedDownloads = categories.downloads
      ? await deleteOldDownloads(cutoff, settings.exemptDomains)
      : 0;

    const run: Run = {
      ts: Date.now(),
      trigger,
      thresholdMs: settings.thresholdMs,
      inactiveDomains: inactive.length,
      deletedHistory,
      deletedDownloads,
    };
    await appendRun(run);
    return run;
  } catch (err) {
    const run: Run = {
      ts: Date.now(),
      trigger,
      thresholdMs: settings.thresholdMs,
      inactiveDomains: 0,
      deletedHistory: 0,
      deletedDownloads: 0,
      error: err instanceof Error ? err.message : String(err),
    };
    await appendRun(run);
    return run;
  } finally {
    await clearInFlight();
  }
}

export interface PreviewResult {
  inactiveDomains: number;
  domains: DomainLastVisit[];
}

export async function previewSweep(): Promise<PreviewResult> {
  const settings = await getSettings();
  const domains = await getAllDomainsWithLastVisit();
  const { inactive } = partitionByThreshold(
    domains,
    settings.thresholdMs,
    settings.exemptDomains,
  );
  return { inactiveDomains: inactive.length, domains: inactive };
}
