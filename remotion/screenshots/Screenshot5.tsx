import { Popup } from '../../src/popup/Popup';
import { POPUP_THRESHOLD_PRESETS } from '../../src/lib/presets';
import { PopupFrame } from '../components/PopupFrame';
import { ScreenshotFrame } from '../components/ScreenshotFrame';
import { MOCK_BUCKETS } from '../mockData';
import '../../src/styles/tokens.css';
import '../../src/styles/reset.css';
import '../../src/components/shared.css';
import '../../src/popup/popup.css';

const DAY = 24 * 60 * 60 * 1000;

export const Screenshot5 = () => (
  <ScreenshotFrame
    index={5}
    total={5}
    title="Dormant data, gone."
    subtitle="Bookmarks and passwords untouched. History, cookies, and site data for sites you actually use, kept."
  >
    <PopupFrame>
      <div style={{ width: 380 }}>
        <Popup
          pendingCount={0}
          threshold={{ ms: 60 * DAY, label: '2 months' }}
          frequency={{ label: 'every 6 hours' }}
          autoTidy={true}
          tidying={false}
          lastSweep={{ agoLabel: 'just now', count: 1247 }}
          domainBuckets={MOCK_BUCKETS}
          thresholdPresetValue="2mo"
          popupPresets={POPUP_THRESHOLD_PRESETS}
          onTidyNow={() => {}}
          onChangeThreshold={() => {}}
          onToggleAutoTidy={() => {}}
          onOpenSettings={() => {}}
        />
      </div>
    </PopupFrame>
  </ScreenshotFrame>
);
