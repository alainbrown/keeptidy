import { describe, expect, it } from 'vitest';
import {
  formatAgo,
  formatDateDots,
  formatDayMonth,
  formatFrequency,
  formatIn,
  formatThresholdCard,
  formatThresholdMs,
} from '../../src/lib/format';

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

describe('formatThresholdMs', () => {
  it('formats minutes for sub-hour durations', () => {
    expect(formatThresholdMs(1 * MINUTE)).toBe('1 minute');
    expect(formatThresholdMs(5 * MINUTE)).toBe('5 minutes');
  });
  it('formats hours for sub-day durations', () => {
    expect(formatThresholdMs(1 * HOUR)).toBe('1 hour');
    expect(formatThresholdMs(3 * HOUR)).toBe('3 hours');
  });
  it('formats day labels for 1–6 days', () => {
    expect(formatThresholdMs(1 * DAY)).toBe('1 day');
    expect(formatThresholdMs(3 * DAY)).toBe('3 days');
  });
  it('formats weeks for 7–27 days', () => {
    expect(formatThresholdMs(7 * DAY)).toBe('1 week');
    expect(formatThresholdMs(14 * DAY)).toBe('2 weeks');
  });
  it('formats months for 28–364 days', () => {
    expect(formatThresholdMs(30 * DAY)).toBe('1 month');
    expect(formatThresholdMs(60 * DAY)).toBe('2 months');
    expect(formatThresholdMs(180 * DAY)).toBe('6 months');
  });
  it('formats years for 365+ days', () => {
    expect(formatThresholdMs(365 * DAY)).toBe('1 year');
    expect(formatThresholdMs(730 * DAY)).toBe('2 years');
  });
});

describe('formatThresholdCard', () => {
  it('combines human label with day count', () => {
    expect(formatThresholdCard(60 * DAY)).toBe('2 months · 60 days');
    expect(formatThresholdCard(7 * DAY)).toBe('1 week · 7 days');
  });
});

describe('formatAgo', () => {
  const now = 1_700_000_000_000;
  it('shows "just now" for sub-minute', () => {
    expect(formatAgo(now - 30_000, now)).toBe('just now');
  });
  it('shows minutes for sub-hour', () => {
    expect(formatAgo(now - 5 * MINUTE, now)).toBe('5m ago');
  });
  it('shows hours for sub-day', () => {
    expect(formatAgo(now - 3 * HOUR, now)).toBe('3h ago');
  });
  it('shows days for day+ durations', () => {
    expect(formatAgo(now - 3 * DAY, now)).toBe('3d ago');
  });
});

describe('formatIn', () => {
  const now = 1_700_000_000_000;
  it('returns "now" for past or current', () => {
    expect(formatIn(now, now)).toBe('now');
    expect(formatIn(now - 1000, now)).toBe('now');
  });
  it('shows minutes for sub-hour future', () => {
    expect(formatIn(now + 47 * MINUTE, now)).toBe('in 47m');
  });
  it('shows hours for sub-day future', () => {
    expect(formatIn(now + 3 * HOUR, now)).toBe('in 3h');
  });
});

describe('formatDateDots', () => {
  it('formats as YYYY·MM·DD', () => {
    const ts = new Date('2026-05-27T12:00:00Z').getTime();
    expect(formatDateDots(ts)).toMatch(/^\d{4}·\d{2}·\d{2}$/);
  });
});

describe('formatFrequency', () => {
  it('maps presets to human labels', () => {
    expect(formatFrequency('manual')).toBe('manual only');
    expect(formatFrequency('hourly')).toBe('every hour');
    expect(formatFrequency('6h')).toBe('every 6 hours');
    expect(formatFrequency('24h')).toBe('every 24 hours');
  });
});

describe('formatDayMonth', () => {
  it('formats as DD/MM', () => {
    const ts = new Date('2026-05-27T12:00:00Z').getTime();
    expect(formatDayMonth(ts)).toMatch(/^\d{2}\/\d{2}$/);
  });
});
