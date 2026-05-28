import type { FrequencyPreset } from './types';

export const ALARM_NAME = 'keeptidy-sweep';

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
    delayInMinutes: periodInMinutes,
    periodInMinutes,
  });
}

export async function nextAlarmAt(): Promise<number | null> {
  const a = await chrome.alarms.get(ALARM_NAME);
  return a?.scheduledTime ?? null;
}
