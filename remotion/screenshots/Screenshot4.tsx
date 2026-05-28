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

export const Screenshot4 = () => (
  <ScreenshotFrame
    index={4}
    total={5}
    title="One click."
    subtitle="Or let it run on its own — every hour, every six hours, daily. Your choice."
    layout="ui-left"
  >
    <PopupFrame>
      <div style={{ width: 380 }}>
        <Popup
          pendingCount={624}
          threshold={{ ms: 60 * DAY, label: '2 months' }}
          frequency={{ label: 'every 6 hours' }}
          autoTidy={true}
          tidying={true}
          lastSweep={{ agoLabel: 'just now', count: 874 }}
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
