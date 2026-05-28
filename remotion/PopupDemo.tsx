import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';
import { Popup } from '../src/popup/Popup';
import { POPUP_THRESHOLD_PRESETS } from '../src/lib/presets';
import { MOCK_BUCKETS } from './mockData';
import '../src/styles/tokens.css';
import '../src/styles/reset.css';
import '../src/components/shared.css';
import '../src/popup/popup.css';

const DAY = 24 * 60 * 60 * 1000;

export const PopupDemo = () => {
  const frame = useCurrentFrame();

  // Frames 0-60: idle at 1,247
  // Frames 60-120: user taps "Tidy now", number counts down
  // Frames 120-180: settle at 0
  const count = Math.round(
    interpolate(frame, [0, 60, 120, 180], [1247, 1247, 0, 0], {
      extrapolateRight: 'clamp',
    }),
  );

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,255,0,0.04), transparent 60%), linear-gradient(180deg, #1c1c20, #131316)',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div
        style={{
          boxShadow:
            '0 1px 0 rgba(255,255,255,0.6) inset, 0 30px 60px -20px rgba(0,0,0,0.6), 0 18px 30px -12px rgba(0,0,0,0.4)',
          borderRadius: 6,
          overflow: 'hidden',
        }}
      >
        <Popup
          pendingCount={count}
          threshold={{ ms: 60 * DAY, label: '2 months' }}
          frequency={{ label: 'every 6 hours' }}
          autoTidy={true}
          tidying={frame >= 60 && frame < 120}
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
    </AbsoluteFill>
  );
};
