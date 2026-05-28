import { AbsoluteFill } from 'remotion';
import { Backdrop } from '../components/Backdrop';
import { BrandLockup } from '../components/BrandLockup';
import '../../src/styles/tokens.css';
import '../../src/styles/reset.css';
import '../../src/components/shared.css';

/**
 * Chrome Web Store small promotional tile · 440 × 280 PNG.
 * Compact branding: wordmark + tagline.
 */
export const PromoTile = () => (
  <Backdrop>
    <AbsoluteFill
      style={{
        padding: '36px 40px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          fontFamily: '"JetBrains Mono", monospace',
          fontSize: 11,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#c8ff00',
        }}
      >
        Chrome Extension
      </div>

      <BrandLockup size={64} />

      <div
        style={{
          fontFamily: '"Funnel Sans", sans-serif',
          fontSize: 16,
          color: 'rgba(246,246,243,0.75)',
          lineHeight: 1.4,
          maxWidth: 320,
        }}
      >
        Browser data, tidied. Clean dormant sites on a schedule.
      </div>
    </AbsoluteFill>
  </Backdrop>
);
