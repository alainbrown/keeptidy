import { describe, expect, it } from 'vitest';
import { frequencyToPeriodMinutes } from '../../src/lib/alarms';

describe('frequencyToPeriodMinutes', () => {
  it('maps each frequency to a period in minutes', () => {
    expect(frequencyToPeriodMinutes('manual')).toBeNull();
    expect(frequencyToPeriodMinutes('hourly')).toBe(60);
    expect(frequencyToPeriodMinutes('6h')).toBe(360);
    expect(frequencyToPeriodMinutes('24h')).toBe(1440);
  });
});
