import { domainOf, matchesExempt } from './history';

export async function clearDomainData(
  domains: string[],
  dataToRemove: chrome.browsingData.DataTypeSet,
): Promise<void> {
  if (domains.length === 0) return;
  if (Object.keys(dataToRemove).length === 0) return;
  // chrome.browsingData.RemovalOptions.origins is typed as a non-empty
  // tuple [string, ...string[]] since @types/chrome 0.1.x; the
  // domains.length === 0 guard above already enforces that at runtime.
  const [first, ...rest] = domains.flatMap((d) => [
    `https://${d}`,
    `http://${d}`,
  ]);
  await chrome.browsingData.remove({ origins: [first, ...rest] }, dataToRemove);
}

// Second clock: history and downloads carry per-entry timestamps, so they
// are cleaned by an entry's own age — anything older than the threshold is
// removed, regardless of whether its domain is still active. Exempt domains
// (`*.notion.so` wildcards) are skipped. We iterate per URL with deleteUrl
// (rather than the cheaper deleteRange) precisely so we can honor the exempt
// list, which has no equivalent in deleteRange. Age subsumes dormancy for
// history: a dormant domain's newest visit is already past the cutoff, so
// this also covers everything the per-domain pass would have removed.
export async function deleteOldHistory(
  beforeMs: number,
  exemptPatterns: string[],
): Promise<number> {
  const items = await chrome.history.search({
    text: '',
    startTime: 0,
    endTime: beforeMs,
    maxResults: 100_000,
  });
  let count = 0;
  for (const item of items) {
    if (!item.url) continue;
    const d = domainOf(item.url);
    if (!d || matchesExempt(d, exemptPatterns)) continue;
    try {
      await chrome.history.deleteUrl({ url: item.url });
      count++;
    } catch {
      // ignore entries that can't be deleted
    }
  }
  return count;
}

export async function deleteOldDownloads(
  beforeMs: number,
  exemptPatterns: string[],
): Promise<number> {
  const items = await chrome.downloads.search({
    endedBefore: new Date(beforeMs).toISOString(),
  });
  let count = 0;
  for (const item of items) {
    const d = item.url ? domainOf(item.url) : null;
    if (!d || matchesExempt(d, exemptPatterns)) continue;
    try {
      await chrome.downloads.erase({ id: item.id });
      count++;
    } catch {
      // ignore items that can't be erased
    }
  }
  return count;
}

export async function eraseAllBrowsingData(): Promise<void> {
  await chrome.browsingData.remove(
    { since: 0 },
    {
      history: true,
      downloads: true,
      cookies: true,
      cacheStorage: true,
      indexedDB: true,
      localStorage: true,
      serviceWorkers: true,
      cache: true,
      formData: true,
    },
  );
}
