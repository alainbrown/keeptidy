import { AbsoluteFill } from 'remotion';
import { Popup } from '../../src/popup/Popup';
import { POPUP_THRESHOLD_PRESETS } from '../../src/lib/presets';
import { Backdrop } from '../components/Backdrop';
import { BrandLockup } from '../components/BrandLockup';
import { PopupFrame } from '../components/PopupFrame';
import { MOCK_BUCKETS } from '../mockData';
import '../../src/styles/tokens.css';
import '../../src/styles/reset.css';
import '../../src/components/shared.css';
import '../../src/popup/popup.css';

const DAY = 24 * 60 * 60 * 1000;

/**
 * Chrome Web Store marquee promotional tile · 1400 × 560 PNG.
 * Hero composition: wordmark + tagline on the left, live popup on the right.
 */
export const Marquee = () => (
  <Backdrop>
    <AbsoluteFill
      style={{
        padding: '60px 80px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 80,
      }}
    >
      {/* Left: brand + copy */}
      <div style={{ flex: 1, maxWidth: 620 }}>
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 13,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: '#c8ff00',
            marginBottom: 28,
          }}
        >
          Chrome Extension
        </div>

        <BrandLockup size={108} />

        <div
          style={{
            fontFamily: '"Funnel Display", sans-serif',
            fontSize: 28,
            fontWeight: 300,
            letterSpacing: '-0.02em',
            color: '#f6f6f3',
            marginTop: 32,
            lineHeight: 1.2,
            maxWidth: 540,
          }}
        >
          Browser data, tidied.
        </div>

        <div
          style={{
            fontFamily: '"Funnel Sans", sans-serif',
            fontSize: 18,
            color: 'rgba(246,246,243,0.65)',
            marginTop: 20,
            lineHeight: 1.5,
            maxWidth: 480,
          }}
        >
          Clean dormant sites on a schedule — history, cookies, site data.
          Bookmarks and passwords stay untouched.
        </div>
      </div>

      {/* Right: live popup */}
      <PopupFrame scale={1.05}>
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
    </AbsoluteFill>
  </Backdrop>
);
