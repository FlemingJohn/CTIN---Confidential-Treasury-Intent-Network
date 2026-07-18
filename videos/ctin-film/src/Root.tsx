import { Composition } from "remotion";
import { Film } from "./Film";
import { totalFrames, FPS } from "./timing";

export const RemotionRoot = () => {
  return (
    <Composition
      id="CtinFilm"
      component={Film}
      durationInFrames={totalFrames}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};
