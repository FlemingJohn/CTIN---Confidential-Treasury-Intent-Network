import { AbsoluteFill, Series } from "remotion";
import { MagmaBackground } from "./components/MagmaBackground";
import { beats, FilmBeat } from "./timing";
import { colors } from "./theme";
import { Hook } from "./beats/Hook";
import { Problem } from "./beats/Problem";
import { Solution } from "./beats/Solution";
import { Architecture } from "./beats/Architecture";
import { Demo } from "./beats/Demo";
import { Proof } from "./beats/Proof";
import { Close } from "./beats/Close";

const beatComponents: Record<string, (props: { beat: FilmBeat }) => JSX.Element> = {
  hook: Hook,
  problem: Problem,
  solution: Solution,
  architecture: Architecture,
  demo: Demo,
  proof: Proof,
  close: Close,
};

export const Film = () => {
  return (
    <AbsoluteFill style={{ backgroundColor: colors.obsidianBase }}>
      <MagmaBackground />
      <Series>
        {beats.map((beat) => {
          const Component = beatComponents[beat.id];
          return (
            <Series.Sequence
              key={beat.id}
              durationInFrames={beat.frames}
              premountFor={30}
              name={beat.id}
            >
              <Component beat={beat} />
            </Series.Sequence>
          );
        })}
      </Series>
    </AbsoluteFill>
  );
};
