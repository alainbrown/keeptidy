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

export const Screenshot1 = () => (
  <ScreenshotFrame
    index={1}
    total={5}
    title="Sites you stop visiting leave data behind."
    subtitle="keeptidy sweeps the dormant ones on a schedule. Bookmarks and passwords stay put."
  >
    <PopupFrame>
      <div style={{ width: 380 }}>
        <Popup
          pendingCount={1247}
          threshold={{ ms: 60 * DAY, label: '2 months' }}
          frequency={{ label: 'every 6 hours' }}
          autoTidy={true}
          tidying={false}
          lastSweep={{ agoLabel: '3d ago', count: 874 }}
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
