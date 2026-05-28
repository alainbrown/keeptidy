import { Checkbox } from '../components/Checkbox';
import type { CategoryFlags } from '../lib/types';

interface CategoriesPanelProps {
  value: CategoryFlags;
  onChange: (next: CategoryFlags) => void;
}

export function CategoriesPanel({ value, onChange }: CategoriesPanelProps) {
  const toggle = (key: keyof CategoryFlags) => {
    onChange({ ...value, [key]: !value[key] });
  };

  return (
    <section className="categories-strip">
      <h3>clean categories</h3>
      <div className="cat-options">
        <Checkbox checked={value.history} onChange={() => toggle('history')}>
          History
        </Checkbox>
        <Checkbox
          checked={value.downloads}
          onChange={() => toggle('downloads')}
        >
          Downloads
        </Checkbox>
        <Checkbox checked={value.cookies} onChange={() => toggle('cookies')}>
          Cookies
        </Checkbox>
        <Checkbox
          checked={value.siteData}
          onChange={() => toggle('siteData')}
        >
          Site data
        </Checkbox>
      </div>
    </section>
  );
}
