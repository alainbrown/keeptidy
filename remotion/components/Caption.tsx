import type { CSSProperties } from 'react';
import { interpolate } from 'remotion';

interface CaptionProps {
  frame: number;
  enterAt: number;
  exitAt: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  style?: CSSProperties;
  align?: 'left' | 'center' | 'right';
}

export const Caption = ({
  frame,
  enterAt,
  exitAt,
  eyebrow,
  title,
  subtitle,
  style,
  align = 'center',
}: CaptionProps) => {
  const opacity = interpolate(
    frame,
    [enterAt, enterAt + 10, exitAt - 10, exitAt],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
  );
  const ty = interpolate(frame, [enterAt, enterAt + 15], [12, 0], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  return (
    <div
      style={{
        opacity,
        transform: `translateY(${ty}px)`,
        textAlign: align,
        ...style,
      }}
    >
      {eyebrow && (
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: 11,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: 'currentColor',
            opacity: 0.55,
            marginBottom: 14,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: '"Funnel Display", sans-serif',
          fontSize: 38,
          fontWeight: 300,
          letterSpacing: '-0.03em',
          lineHeight: 1.05,
          color: 'inherit',
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: '"Funnel Sans", sans-serif',
            fontSize: 17,
            color: 'currentColor',
            opacity: 0.65,
            marginTop: 12,
            lineHeight: 1.45,
            maxWidth: 520,
            ...(align === 'center' ? { marginLeft: 'auto', marginRight: 'auto' } : {}),
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
