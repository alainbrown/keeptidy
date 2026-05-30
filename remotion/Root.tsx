import { Composition, Still } from 'remotion';
import { Demo } from './Demo';
import { Screenshot1 } from './screenshots/Screenshot1';
import { Screenshot2 } from './screenshots/Screenshot2';
import { Screenshot3 } from './screenshots/Screenshot3';
import { Screenshot4 } from './screenshots/Screenshot4';
import { Screenshot5 } from './screenshots/Screenshot5';
import { Marquee } from './store/Marquee';
import { PromoTile } from './store/PromoTile';
import { Thumbnail } from './store/Thumbnail';

export const RemotionRoot = () => (
  <>
    {/* Demo · 1280×720 · 20s @ 30fps. Renders to MP4 (YouTube / CWS)
        and a scaled-down GIF (README hero). */}
    <Composition
      id="Demo"
      component={Demo}
      durationInFrames={600}
      fps={30}
      width={1280}
      height={720}
    />

    {/* Chrome Web Store · 5 screenshots @ 1280×800 */}
    <Still id="Screenshot1" component={Screenshot1} width={1280} height={800} />
    <Still id="Screenshot2" component={Screenshot2} width={1280} height={800} />
    <Still id="Screenshot3" component={Screenshot3} width={1280} height={800} />
    <Still id="Screenshot4" component={Screenshot4} width={1280} height={800} />
    <Still id="Screenshot5" component={Screenshot5} width={1280} height={800} />

    {/* Chrome Web Store · promo tiles */}
    <Still id="PromoTile" component={PromoTile} width={440} height={280} />
    <Still id="Marquee" component={Marquee} width={1400} height={560} />

    {/* YouTube thumbnail · 1280×720 */}
    <Still id="Thumbnail" component={Thumbnail} width={1280} height={720} />
  </>
);
