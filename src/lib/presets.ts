import type { ThresholdPreset } from './types';

const DAY = 24 * 60 * 60 * 1000;

export const PRESET_TO_MS: Record<ThresholdPreset, number> = {
  '1d': 1 * DAY,
  '1w': 7 * DAY,
  '2w': 14 * DAY,
  '1mo': 30 * DAY,
  '2mo': 60 * DAY,
  '6mo': 180 * DAY,
  '1yr': 365 * DAY,
};

export const ALL_THRESHOLD_PRESETS: ThresholdPreset[] = [
  '1d',
  '1w',
  '2w',
  '1mo',
  '2mo',
  '6mo',
  '1yr',
];

export const POPUP_THRESHOLD_PRESETS: ThresholdPreset[] = [
  '1d',
  '1w',
  '2w',
  '1mo',
  '2mo',
];

export function msToPreset(ms: number): ThresholdPreset | 'custom' {
  for (const key of ALL_THRESHOLD_PRESETS) {
    if (PRESET_TO_MS[key] === ms) return key;
  }
  return 'custom';
}
