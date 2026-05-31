import { describe, expect, it, vi } from 'vitest';
import { deleteOldDownloads, deleteOldHistory } from '../../src/lib/browsingData';

// History items are partial — the code only reads `url`.
const history = (urls: (string | undefined)[]) =>
  urls.map((url) => ({ url })) as unknown as chrome.history.HistoryItem[];

const downloads = (items: { id: number; url?: string }[]) =>
  items as unknown as chrome.downloads.DownloadItem[];

describe('deleteOldHistory', () => {
  it('deletes the non-exempt entries the search returns and counts them', async () => {
    vi.spyOn(chrome.history, 'search').mockResolvedValue(
      history(['https://old-a.example/x', 'https://old-b.example/y']),
    );
    const deleteUrl = vi
      .spyOn(chrome.history, 'deleteUrl')
      .mockResolvedValue(undefined);

    const count = await deleteOldHistory(1000, []);

    expect(count).toBe(2);
    expect(deleteUrl).toHaveBeenCalledWith({ url: 'https://old-a.example/x' });
    expect(deleteUrl).toHaveBeenCalledWith({ url: 'https://old-b.example/y' });
  });

  // The age filter is delegated to chrome.history.search's endTime — the API
  // only returns entries older than the cutoff, so "recent entries survive"
  // is enforced here rather than by re-filtering in our code.
  it('passes the cutoff as the search endTime', async () => {
    const search = vi.spyOn(chrome.history, 'search').mockResolvedValue([]);
    await deleteOldHistory(12345, []);
    expect(search).toHaveBeenCalledWith(
      expect.objectContaining({ endTime: 12345 }),
    );
  });

  it('skips exempt domains, including wildcards', async () => {
    vi.spyOn(chrome.history, 'search').mockResolvedValue(
      history([
        'https://drop.example/a',
        'https://keep.example/b',
        'https://sub.wild.example/c',
      ]),
    );
    const deleteUrl = vi
      .spyOn(chrome.history, 'deleteUrl')
      .mockResolvedValue(undefined);

    const count = await deleteOldHistory(1000, ['keep.example', '*.wild.example']);

    expect(count).toBe(1);
    expect(deleteUrl).toHaveBeenCalledTimes(1);
    expect(deleteUrl).toHaveBeenCalledWith({ url: 'https://drop.example/a' });
  });

  it('ignores entries without a url', async () => {
    vi.spyOn(chrome.history, 'search').mockResolvedValue(
      history(['https://x.example/a', undefined]),
    );
    const deleteUrl = vi
      .spyOn(chrome.history, 'deleteUrl')
      .mockResolvedValue(undefined);

    const count = await deleteOldHistory(1000, []);

    expect(count).toBe(1);
    expect(deleteUrl).toHaveBeenCalledTimes(1);
  });
});

describe('deleteOldDownloads', () => {
  it('erases the non-exempt downloads the search returns and counts them', async () => {
    vi.spyOn(chrome.downloads, 'search').mockResolvedValue(
      downloads([{ id: 1, url: 'https://old.example/file.zip' }]),
    );
    const erase = vi.spyOn(chrome.downloads, 'erase').mockResolvedValue([1]);

    const count = await deleteOldDownloads(1000, []);

    expect(count).toBe(1);
    expect(erase).toHaveBeenCalledWith({ id: 1 });
  });

  // Age is delegated to the endedBefore query: a download that ended after
  // the cutoff is never returned, so a recent download survives even when
  // its domain is otherwise dormant. We assert the query carries the cutoff.
  it('queries only downloads that ended before the cutoff', async () => {
    const search = vi.spyOn(chrome.downloads, 'search').mockResolvedValue([]);
    await deleteOldDownloads(1000, []);
    expect(search).toHaveBeenCalledWith({
      endedBefore: new Date(1000).toISOString(),
    });
  });

  it('skips exempt domains', async () => {
    vi.spyOn(chrome.downloads, 'search').mockResolvedValue(
      downloads([
        { id: 1, url: 'https://keep.example/a.zip' },
        { id: 2, url: 'https://drop.example/b.zip' },
      ]),
    );
    const erase = vi.spyOn(chrome.downloads, 'erase').mockResolvedValue([]);

    const count = await deleteOldDownloads(1000, ['keep.example']);

    expect(count).toBe(1);
    expect(erase).toHaveBeenCalledTimes(1);
    expect(erase).toHaveBeenCalledWith({ id: 2 });
  });

  it('ignores downloads without a url', async () => {
    vi.spyOn(chrome.downloads, 'search').mockResolvedValue(
      downloads([{ id: 1 }, { id: 2, url: 'https://x.example/y.zip' }]),
    );
    const erase = vi.spyOn(chrome.downloads, 'erase').mockResolvedValue([]);

    const count = await deleteOldDownloads(1000, []);

    expect(count).toBe(1);
    expect(erase).toHaveBeenCalledWith({ id: 2 });
  });
});
