import { CategoriesPanel } from '../../src/options/CategoriesPanel';
import { ExemptDomainsPanel } from '../../src/options/ExemptDomainsPanel';
import { FrequencyPanel } from '../../src/options/FrequencyPanel';
import { ScreenshotFrame } from '../components/ScreenshotFrame';
import '../../src/styles/tokens.css';
import '../../src/styles/reset.css';
import '../../src/components/shared.css';
import '../../src/options/options.css';

export const Screenshot3 = () => (
  <ScreenshotFrame
    index={3}
    total={5}
    title="Or make it yours."
    subtitle="Choose what gets cleaned, how often, and which domains stay forever."
    layout="ui-center"
  >
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, width: 940 }}>
      <CategoriesPanel
        value={{ history: true, downloads: true, cookies: true, siteData: false }}
        onChange={() => {}}
      />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <FrequencyPanel value="6h" onChange={() => {}} />
        <ExemptDomainsPanel
          domains={[
            'github.com',
            '*.notion.so',
            'mail.google.com',
            'accounts.google.com',
            '*.slack.com',
            '*.figma.com',
            'localhost',
          ]}
          onAdd={() => {}}
          onRemove={() => {}}
        />
      </div>
    </div>
  </ScreenshotFrame>
);
