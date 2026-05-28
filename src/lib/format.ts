import type { FrequencyPreset } from './types';

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function formatThresholdMs(ms: number): string {
  if (ms < HOUR) {
    const m = Math.max(1, Math.round(ms / MINUTE));
    return `${m} minute${m === 1 ? '' : 's'}`;
  }
  if (ms < DAY) {
    const h = Math.round(ms / HOUR);
    return `${h} hour${h === 1 ? '' : 's'}`;
  }
  const days = Math.round(ms / DAY);
  if (days === 1) return '1 day';
  if (days < 7) return `${days} days`;
  if (days < 28) {
    const w = Math.round(days / 7);
    return `${w} week${w === 1 ? '' : 's'}`;
  }
  if (days < 365) {
    const mo = Math.round(days / 30);
    return `${mo} month${mo === 1 ? '' : 's'}`;
  }
  const y = Math.round(days / 365);
  return `${y} year${y === 1 ? '' : 's'}`;
}

export function formatThresholdCard(ms: number): string {
  const days = Math.round(ms / DAY);
  return `${formatThresholdMs(ms)} · ${days} days`;
}

export function formatAgo(ts: number, now: number = Date.now()): string {
  const ms = Math.max(0, now - ts);
  if (ms < MINUTE) return 'just now';
  if (ms < HOUR) return `${Math.round(ms / MINUTE)}m ago`;
  if (ms < DAY) return `${Math.round(ms / HOUR)}h ago`;
  return `${Math.round(ms / DAY)}d ago`;
}

export function formatIn(ts: number, now: number = Date.now()): string {
  const ms = ts - now;
  if (ms <= 0) return 'now';
  if (ms < HOUR) return `in ${Math.max(1, Math.round(ms / MINUTE))}m`;
  if (ms < DAY) return `in ${Math.round(ms / HOUR)}h`;
  return `in ${Math.round(ms / DAY)}d`;
}

export function formatDateDots(ts: number = Date.now()): string {
  const d = new Date(ts);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}·${mm}·${dd}`;
}

export function formatFrequency(freq: FrequencyPreset): string {
  switch (freq) {
    case 'manual':
      return 'manual only';
    case 'hourly':
      return 'every hour';
    case '6h':
      return 'every 6 hours';
    case '24h':
      return 'every 24 hours';
  }
}

export function formatDayMonth(ts: number): string {
  const d = new Date(ts);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  return `${dd}/${mm}`;
}
