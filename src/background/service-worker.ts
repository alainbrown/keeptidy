import { ALARM_NAME, reconcileAlarm } from '../lib/alarms';
import { eraseAllBrowsingData } from '../lib/browsingData';
import { getSettings } from '../lib/chromeStorage';
import type { Message, Response } from '../lib/messaging';
import { previewSweep, runSweep } from '../lib/sweep';
import type { Settings } from '../lib/types';

async function bootstrap() {
  const s = await getSettings();
  await reconcileAlarm(s.autoTidy, s.frequency);
}

chrome.runtime.onInstalled.addListener(() => {
  void bootstrap();
});

chrome.runtime.onStartup.addListener(() => {
  void bootstrap();
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (area !== 'sync' || !changes.settings) return;
  const next = changes.settings.newValue as Settings | undefined;
  if (!next) return;
  void reconcileAlarm(next.autoTidy, next.frequency);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  void runSweep('auto');
});

chrome.runtime.onMessage.addListener(
  (msg: Message, _sender, sendResponse: (r: Response) => void) => {
    (async () => {
      try {
        switch (msg.type) {
          case 'tidy-now': {
            const run = await runSweep('manual');
            sendResponse({ ok: true, data: run });
            break;
          }
          case 'erase-all': {
            await eraseAllBrowsingData();
            sendResponse({ ok: true });
            break;
          }
          case 'preview': {
            const data = await previewSweep();
            sendResponse({ ok: true, data });
            break;
          }
        }
      } catch (err) {
        sendResponse({
          ok: false,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    })();
    return true;
  },
);
