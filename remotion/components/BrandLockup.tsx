import type { CSSProperties } from 'react';

interface BrandLockupProps {
  size?: number;
  subtitle?: string;
  variant?: 'light-on-dark' | 'dark-on-light';
  style?: CSSProperties;
}

export const BrandLockup = ({
  size = 96,
  subtitle,
  variant = 'light-on-dark',
  style,
}: BrandLockupProps) => {
  const ink = variant === 'light-on-dark' ? '#f6f6f3' : '#14141a';
  const sub =
    variant === 'light-on-dark' ? 'rgba(246,246,243,0.55)' : 'rgba(20,20,26,0.55)';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 14,
        ...style,
      }}
    >
      <div
        style={{
          fontFamily: '"Funnel Display", sans-serif',
          fontWeight: 300,
          fontSize: size,
          letterSpacing: '-0.05em',
          lineHeight: 1,
          color: ink,
        }}
      >
        keep
        <em
          style={{
            fontStyle: 'normal',
            fontWeight: 700,
          }}
        >
          tidy
        </em>
        <span style={{ color: '#6f8a00' }}>.</span>
      </div>
      {subtitle && (
        <div
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: Math.max(10, size * 0.13),
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            color: sub,
          }}
        >
          {subtitle}
        </div>
      )}
    </div>
  );
};
