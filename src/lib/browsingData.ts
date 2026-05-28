export async function clearDomainData(domains: string[]): Promise<void> {
  if (domains.length === 0) return;
  const origins = domains.flatMap((d) => [`https://${d}`, `http://${d}`]);
  await chrome.browsingData.remove(
    { origins },
    {
      cookies: true,
      cacheStorage: true,
      indexedDB: true,
      localStorage: true,
      serviceWorkers: true,
    },
  );
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
