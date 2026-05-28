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

export async function deleteOldHistory(beforeMs: number): Promise<number> {
  const items = await chrome.history.search({
    text: '',
    startTime: 0,
    endTime: beforeMs,
    maxResults: 100_000,
  });
  const count = items.length;
  await chrome.history.deleteRange({ startTime: 0, endTime: beforeMs });
  return count;
}

export async function deleteOldDownloads(beforeMs: number): Promise<number> {
  const items = await chrome.downloads.search({
    endedBefore: new Date(beforeMs).toISOString(),
  });
  let count = 0;
  for (const item of items) {
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
