import type { FrequencyPreset } from './types';

export const ALARM_NAME = 'keeptidy-sweep';

// The first sweep fires this many minutes after the alarm is (re)created —
// i.e. shortly after browser launch — instead of a full period later.
// reconcileAlarm runs on every onStartup and resets the alarm, so tying the
// initial delay to the period meant users whose sessions are shorter than
// the period (and who restart before it elapsed) reset the countdown every
// launch and never got an auto-sweep. A short fixed delay guarantees a sweep
// each session while still skipping sub-minute "quick launch" sessions.
const STARTUP_DELAY_MINUTES = 4;

export function frequencyToPeriodMinutes(freq: FrequencyPreset): number | null {
  switch (freq) {
    case 'manual':
      return null;
    case 'hourly':
      return 60;
    case '6h':
      return 360;
    case '24h':
      return 1440;
  }
}

export async function reconcileAlarm(
  autoTidy: boolean,
  freq: FrequencyPreset,
): Promise<void> {
  await chrome.alarms.clear(ALARM_NAME);
  if (!autoTidy) return;
  const periodInMinutes = frequencyToPeriodMinutes(freq);
  if (periodInMinutes == null) return;
  await chrome.alarms.create(ALARM_NAME, {
    delayInMinutes: STARTUP_DELAY_MINUTES,
    periodInMinutes,
  });
}

export async function nextAlarmAt(): Promise<number | null> {
  const a = await chrome.alarms.get(ALARM_NAME);
  return a?.scheduledTime ?? null;
}
