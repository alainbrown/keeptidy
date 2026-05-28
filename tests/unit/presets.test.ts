import { describe, expect, it } from 'vitest';
import {
  ALL_THRESHOLD_PRESETS,
  POPUP_THRESHOLD_PRESETS,
  PRESET_TO_MS,
  msToPreset,
} from '../../src/lib/presets';

const DAY = 24 * 60 * 60 * 1000;

describe('msToPreset', () => {
  it('returns the matching preset', () => {
    expect(msToPreset(PRESET_TO_MS['2mo'])).toBe('2mo');
    expect(msToPreset(PRESET_TO_MS['1w'])).toBe('1w');
  });
  it('returns "custom" for non-matching values', () => {
    expect(msToPreset(47 * DAY)).toBe('custom');
  });
});

describe('preset arrays', () => {
  it('popup is a subset of all', () => {
    for (const p of POPUP_THRESHOLD_PRESETS) {
      expect(ALL_THRESHOLD_PRESETS).toContain(p);
    }
  });
});
