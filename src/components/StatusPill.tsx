interface StatusPillProps {
  on: boolean;
  label: string;
}

export function StatusPill({ on, label }: StatusPillProps) {
  return (
    <div className={`status${on ? ' status-on' : ' status-off'}`}>
      <span className="dot" />
      <span>{label}</span>
    </div>
  );
}
