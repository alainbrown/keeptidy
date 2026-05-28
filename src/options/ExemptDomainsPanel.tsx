import { useState } from 'react';

interface ExemptDomainsPanelProps {
  domains: string[];
  onAdd: (pattern: string) => void;
  onRemove: (pattern: string) => void;
}

export function ExemptDomainsPanel({
  domains,
  onAdd,
  onRemove,
}: ExemptDomainsPanelProps) {
  const [input, setInput] = useState('');

  const submit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setInput('');
  };

  return (
    <div className="panel">
      <h2>
        exempt domains <span className="badge">{domains.length} kept</span>
      </h2>
      <div className="doms">
        {domains.map((d) => (
          <div key={d} className="dom">
            <span>{d}</span>
            <span
              className="x"
              role="button"
              aria-label={`Remove ${d}`}
              tabIndex={0}
              onClick={() => onRemove(d)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onRemove(d);
                }
              }}
            >
              ×
            </span>
          </div>
        ))}
      </div>
      <div className="add-input">
        <input
          type="text"
          placeholder="add domain..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit();
          }}
        />
        <button onClick={submit}>+</button>
      </div>
    </div>
  );
}
