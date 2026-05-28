import type { ReactNode } from 'react';
import { AbsoluteFill } from 'remotion';

interface BackdropProps {
  children: ReactNode;
  variant?: 'dark' | 'light';
}

export const Backdrop = ({ children, variant = 'dark' }: BackdropProps) => {
  if (variant === 'light') {
    return (
      <AbsoluteFill
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 100% 0%, rgba(0,0,0,0.04), transparent 60%), radial-gradient(ellipse 60% 40% at 0% 100%, rgba(200,255,0,0.05), transparent 60%), linear-gradient(180deg, #f6f6f3 0%, #ececea 100%)',
          color: '#14141a',
          fontFamily: '"Funnel Sans", sans-serif',
        }}
      >
        <AbsoluteFill
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='0.6' fill='%2314141a' opacity='0.18'/%3E%3C/svg%3E\")",
            backgroundSize: '24px 24px',
            pointerEvents: 'none',
          }}
        />
        {children}
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill
      style={{
        background:
          'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(200,255,0,0.06), transparent 60%), linear-gradient(180deg, #1c1c20, #131316)',
        color: '#f6f6f3',
        fontFamily: '"Funnel Sans", sans-serif',
      }}
    >
      <AbsoluteFill
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='0.55' fill='%23f6f6f3' opacity='0.08'/%3E%3C/svg%3E\")",
          backgroundSize: '24px 24px',
          pointerEvents: 'none',
        }}
      />
      {children}
    </AbsoluteFill>
  );
};
