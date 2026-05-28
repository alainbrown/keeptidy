import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

export default defineManifest({
  manifest_version: 3,
  name: 'keeptidy',
  version: pkg.version,
  description: 'Tidy old browser data — sweep dormant sites on a schedule.',
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'keeptidy',
  },
  options_page: 'src/options/index.html',
  background: {
    service_worker: 'src/background/service-worker.ts',
    type: 'module',
  },
  permissions: [
    'history',
    'storage',
    'alarms',
    'downloads',
    'browsingData',
    'cookies',
  ],
});
