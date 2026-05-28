import { defineManifest } from '@crxjs/vite-plugin';
import pkg from './package.json' with { type: 'json' };

export default defineManifest({
  manifest_version: 3,
  name: 'keeptidy',
  version: pkg.version,
  description: 'Tidy old browser data — sweep dormant sites on a schedule.',
  icons: {
    '16': 'public/icons/16.png',
    '32': 'public/icons/32.png',
    '48': 'public/icons/48.png',
    '128': 'public/icons/128.png',
  },
  action: {
    default_popup: 'src/popup/index.html',
    default_title: 'keeptidy',
    default_icon: {
      '16': 'public/icons/16.png',
      '32': 'public/icons/32.png',
      '48': 'public/icons/48.png',
    },
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
