import type { ReactNode } from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  children: ReactNode;
}

export function Checkbox({ checked, onChange, children }: CheckboxProps) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      className="category"
      onClick={() => onChange(!checked)}
    >
      <span className={`checkbox${checked ? ' on' : ''}`} aria-hidden="true" />
      <span>{children}</span>
    </button>
  );
}
