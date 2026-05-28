import { Composition } from 'remotion';
import { OptionsDemo } from './OptionsDemo';
import { PopupDemo } from './PopupDemo';

export const RemotionRoot = () => (
  <>
    <Composition
      id="Popup"
      component={PopupDemo}
      durationInFrames={180}
      fps={30}
      width={760}
      height={760}
    />
    <Composition
      id="Options"
      component={OptionsDemo}
      durationInFrames={240}
      fps={30}
      width={1440}
      height={900}
    />
  </>
);
