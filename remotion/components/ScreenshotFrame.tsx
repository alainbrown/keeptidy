import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';
import { Backdrop } from './Backdrop';
import { BrandLockup } from './BrandLockup';

interface ScreenshotFrameProps {
  index: number;
  total: number;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Where the UI block sits relative to the caption. */
  layout?: 'ui-right' | 'ui-left' | 'ui-center';
}

export const ScreenshotFrame = ({
  index,
  total,
  title,
  subtitle,
  children,
  layout = 'ui-right',
}: ScreenshotFrameProps) => {
  return (
    <Backdrop>
      {/* Top bar with mini wordmark + step indicator */}
      <div
        style={{
          position: 'absolute',
          top: 40,
          left: 60,
          right: 60,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <BrandLockup size={32} />
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 12,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'rgba(246,246,243,0.55)',
          }}
        >
          {String(index).padStart(2, '0')} · {String(total).padStart(2, '0')}
        </div>
      </div>

      {/* Two-column body */}
      <AbsoluteFill
        style={{
          paddingTop: 110,
          paddingBottom: 60,
          paddingLeft: 60,
          paddingRight: 60,
          display: 'flex',
          flexDirection:
            layout === 'ui-left' ? 'row-reverse' : layout === 'ui-center' ? 'column' : 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: layout === 'ui-center' ? 36 : 60,
        }}
      >
        {/* Caption */}
        <div
          style={{
            flex: layout === 'ui-center' ? '0 0 auto' : 1,
            maxWidth: layout === 'ui-center' ? 980 : 480,
            textAlign: layout === 'ui-center' ? 'center' : 'left',
          }}
        >
          <div
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: 13,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#c8ff00',
              marginBottom: 18,
            }}
          >
            {String(index).padStart(2, '0')}
          </div>
          <div
            style={{
              fontFamily: '"Funnel Display", sans-serif',
              fontSize: 56,
              fontWeight: 300,
              letterSpacing: '-0.04em',
              lineHeight: 1.02,
              color: '#f6f6f3',
            }}
          >
            {title}
          </div>
          {subtitle && (
            <div
              style={{
                fontFamily: '"Funnel Sans", sans-serif',
                fontSize: 20,
                color: 'rgba(246,246,243,0.65)',
                marginTop: 18,
                lineHeight: 1.45,
                maxWidth: layout === 'ui-center' ? 760 : undefined,
                ...(layout === 'ui-center'
                  ? { marginLeft: 'auto', marginRight: 'auto' }
                  : {}),
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        {/* UI block. Reset color to ink — the panel components inherit text
            color from body in the real extension (where body is light-themed),
            but the Backdrop here is dark and would tint their text. */}
        <div
          style={{
            flex: layout === 'ui-center' ? '0 0 auto' : '0 1 auto',
            display: 'flex',
            justifyContent: 'center',
            color: '#14141a',
          }}
        >
          {children}
        </div>
      </AbsoluteFill>
    </Backdrop>
  );
};
