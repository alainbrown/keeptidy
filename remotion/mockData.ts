import type { DomainBucket, Run } from '../src/lib/types';

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

export const MOCK_BUCKETS: DomainBucket[] = [
  { lastVisitAgoMs: 730 * DAY, domainCount: 84 },
  { lastVisitAgoMs: 365 * DAY, domainCount: 120 },
  { lastVisitAgoMs: 180 * DAY, domainCount: 240 },
  { lastVisitAgoMs: 90 * DAY, domainCount: 340 },
  { lastVisitAgoMs: 60 * DAY, domainCount: 463 },
  { lastVisitAgoMs: 30 * DAY, domainCount: 280 },
  { lastVisitAgoMs: 14 * DAY, domainCount: 180 },
  { lastVisitAgoMs: 7 * DAY, domainCount: 120 },
  { lastVisitAgoMs: 0, domainCount: 80 },
];

export const MOCK_RUNS: Run[] = [
  {
    ts: Date.now() - 3 * DAY,
    trigger: 'auto',
    thresholdMs: 60 * DAY,
    inactiveDomains: 874,
    deletedHistory: 3210,
    deletedDownloads: 4,
  },
  {
    ts: Date.now() - 4 * DAY,
    trigger: 'auto',
    thresholdMs: 60 * DAY,
    inactiveDomains: 62,
    deletedHistory: 215,
    deletedDownloads: 0,
  },
  {
    ts: Date.now() - 5 * DAY,
    trigger: 'manual',
    thresholdMs: 60 * DAY,
    inactiveDomains: 418,
    deletedHistory: 1502,
    deletedDownloads: 2,
  },
  {
    ts: Date.now() - 5 * DAY - 6 * HOUR,
    trigger: 'auto',
    thresholdMs: 60 * DAY,
    inactiveDomains: 54,
    deletedHistory: 198,
    deletedDownloads: 0,
  },
  {
    ts: Date.now() - 6 * DAY,
    trigger: 'auto',
    thresholdMs: 60 * DAY,
    inactiveDomains: 0,
    deletedHistory: 0,
    deletedDownloads: 0,
  },
];
