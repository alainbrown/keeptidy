import type { DomainBucket } from './types';

const DAY = 24 * 60 * 60 * 1000;

export function domainOf(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

export function matchesExempt(domain: string, patterns: string[]): boolean {
  return patterns.some((p) => {
    if (p === domain) return true;
    if (p.startsWith('*.')) {
      const suffix = p.slice(2);
      return domain === suffix || domain.endsWith('.' + suffix);
    }
    return false;
  });
}

export interface DomainLastVisit {
  domain: string;
  lastVisitTime: number;
}

export async function getAllDomainsWithLastVisit(): Promise<DomainLastVisit[]> {
  const items = await chrome.history.search({
    text: '',
    startTime: 0,
    maxResults: 100_000,
  });
  const map = new Map<string, number>();
  for (const item of items) {
    if (!item.url || item.lastVisitTime == null) continue;
    const d = domainOf(item.url);
    if (!d) continue;
    const prev = map.get(d);
    if (prev == null || item.lastVisitTime > prev) {
      map.set(d, item.lastVisitTime);
    }
  }
  return Array.from(map, ([domain, lastVisitTime]) => ({ domain, lastVisitTime }));
}

export interface PartitionResult {
  inactive: DomainLastVisit[];
  active: DomainLastVisit[];
  exempt: DomainLastVisit[];
}

export function partitionByThreshold(
  domains: DomainLastVisit[],
  thresholdMs: number,
  exemptPatterns: string[],
  now: number = Date.now(),
): PartitionResult {
  const cutoff = now - thresholdMs;
  const inactive: DomainLastVisit[] = [];
  const active: DomainLastVisit[] = [];
  const exempt: DomainLastVisit[] = [];
  for (const d of domains) {
    if (matchesExempt(d.domain, exemptPatterns)) {
      exempt.push(d);
    } else if (d.lastVisitTime < cutoff) {
      inactive.push(d);
    } else {
      active.push(d);
    }
  }
  return { inactive, active, exempt };
}

const BUCKET_BOUNDARIES_MS = [
  0,
  7 * DAY,
  14 * DAY,
  30 * DAY,
  60 * DAY,
  90 * DAY,
  180 * DAY,
  365 * DAY,
  730 * DAY,
];

export function bucketDomains(
  domains: DomainLastVisit[],
  now: number = Date.now(),
): DomainBucket[] {
  const counts = new Array(BUCKET_BOUNDARIES_MS.length).fill(0) as number[];
  for (const d of domains) {
    const ago = now - d.lastVisitTime;
    let bucket = 0;
    for (let i = 0; i < BUCKET_BOUNDARIES_MS.length; i++) {
      if (ago >= BUCKET_BOUNDARIES_MS[i]) bucket = i;
    }
    counts[bucket]++;
  }
  return BUCKET_BOUNDARIES_MS.map((lastVisitAgoMs, i) => ({
    lastVisitAgoMs,
    domainCount: counts[i],
  }));
}
