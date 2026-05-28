import { TimelinePanel } from '../../src/options/TimelinePanel';
import { ScreenshotFrame } from '../components/ScreenshotFrame';
import { MOCK_BUCKETS } from '../mockData';
import '../../src/styles/tokens.css';
import '../../src/styles/reset.css';
import '../../src/components/shared.css';
import '../../src/options/options.css';

const DAY = 24 * 60 * 60 * 1000;

export const Screenshot2 = () => (
  <ScreenshotFrame
    index={2}
    total={5}
    title="Pick a threshold."
    subtitle="Anything older than the window gets cleaned. Drag the marker or tap a preset."
  >
    <div style={{ width: 680 }}>
      <TimelinePanel
        thresholdMs={60 * DAY}
        pendingCount={1247}
        keptCount={20530}
        buckets={MOCK_BUCKETS}
        onChange={() => {}}
      />
    </div>
  </ScreenshotFrame>
);
