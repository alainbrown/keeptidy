import { describe, expect, it } from 'vitest';
import {
  bucketDomains,
  domainOf,
  matchesExempt,
  partitionByThreshold,
} from '../../src/lib/history';

const DAY = 24 * 60 * 60 * 1000;

describe('domainOf', () => {
  it('extracts hostname from a valid URL', () => {
    expect(domainOf('https://github.com/anthropics')).toBe('github.com');
    expect(domainOf('http://localhost:3000/x')).toBe('localhost');
  });
  it('returns null for invalid URLs', () => {
    expect(domainOf('not a url')).toBeNull();
    expect(domainOf('')).toBeNull();
  });
});

describe('matchesExempt', () => {
  it('matches exact domain', () => {
    expect(matchesExempt('github.com', ['github.com'])).toBe(true);
    expect(matchesExempt('github.com', ['gitlab.com'])).toBe(false);
  });
  it('matches wildcard subdomain', () => {
    expect(matchesExempt('docs.notion.so', ['*.notion.so'])).toBe(true);
    expect(matchesExempt('notion.so', ['*.notion.so'])).toBe(true);
  });
  it('rejects substrings that are not subdomains', () => {
    expect(matchesExempt('evilnotion.so', ['*.notion.so'])).toBe(false);
  });
  it('matches if any pattern matches', () => {
    expect(matchesExempt('localhost', ['github.com', 'localhost'])).toBe(true);
  });
});

describe('partitionByThreshold', () => {
  const now = 1_700_000_000_000;
  const domains = [
    { domain: 'recent.com', lastVisitTime: now - 5 * DAY },
    { domain: 'stale.com', lastVisitTime: now - 90 * DAY },
    { domain: 'github.com', lastVisitTime: now - 365 * DAY },
    { domain: 'fresh.com', lastVisitTime: now - 1 * DAY },
  ];

  it('puts recent visits in active', () => {
    const r = partitionByThreshold(domains, 60 * DAY, ['github.com'], now);
    expect(r.active.map((d) => d.domain).sort()).toEqual([
      'fresh.com',
      'recent.com',
    ]);
  });
  it('puts old visits in inactive', () => {
    const r = partitionByThreshold(domains, 60 * DAY, ['github.com'], now);
    expect(r.inactive.map((d) => d.domain)).toEqual(['stale.com']);
  });
  it('puts exempt domains in exempt regardless of age', () => {
    const r = partitionByThreshold(domains, 60 * DAY, ['github.com'], now);
    expect(r.exempt.map((d) => d.domain)).toEqual(['github.com']);
  });
  it('respects wildcard exemption', () => {
    const ds = [
      { domain: 'docs.notion.so', lastVisitTime: now - 365 * DAY },
      { domain: 'random.com', lastVisitTime: now - 365 * DAY },
    ];
    const r = partitionByThreshold(ds, 60 * DAY, ['*.notion.so'], now);
    expect(r.exempt.map((d) => d.domain)).toEqual(['docs.notion.so']);
    expect(r.inactive.map((d) => d.domain)).toEqual(['random.com']);
  });
});

describe('bucketDomains', () => {
  const now = 1_700_000_000_000;
  it('places each domain in the largest bucket boundary it exceeds', () => {
    const ds = [
      { domain: 'a.com', lastVisitTime: now - 1 * DAY },
      { domain: 'b.com', lastVisitTime: now - 8 * DAY },
      { domain: 'c.com', lastVisitTime: now - 100 * DAY },
      { domain: 'd.com', lastVisitTime: now - 800 * DAY },
    ];
    const buckets = bucketDomains(ds, now);
    const total = buckets.reduce((s, b) => s + b.domainCount, 0);
    expect(total).toBe(4);
    expect(buckets[0].domainCount).toBe(1); // 0-7d (a.com)
    expect(buckets[1].domainCount).toBe(1); // 7-14d (b.com)
    expect(buckets[5].domainCount).toBe(1); // 90-180d (c.com)
    expect(buckets[8].domainCount).toBe(1); // 730d+ (d.com)
  });
});
