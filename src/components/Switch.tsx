interface SwitchProps {
  on: boolean;
  onChange: (next: boolean) => void;
}

export function Switch({ on, onChange }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      className={`switch${on ? ' on' : ''}`}
      onClick={() => onChange(!on)}
    />
  );
}
