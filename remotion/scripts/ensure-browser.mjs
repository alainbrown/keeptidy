// Pre-downloads the Chromium binary Remotion uses for off-screen rendering,
// so the Docker image is ready to render immediately at `docker run` time.
import { ensureBrowser } from '@remotion/renderer';

await ensureBrowser();
console.log('✓ Remotion Chromium ready');
