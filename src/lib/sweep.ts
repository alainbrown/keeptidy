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
    const domains = await getAllDomainsWithLastVisit();
    const { inactive } = partitionByThreshold(
      domains,
      settings.thresholdMs,
      settings.exemptDomains,
      startedAt,
    );

    await clearDomainData(inactive.map((d) => d.domain));
    const deletedHistory = await deleteOldHistory(cutoff);
    const deletedDownloads = await deleteOldDownloads(cutoff);

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
