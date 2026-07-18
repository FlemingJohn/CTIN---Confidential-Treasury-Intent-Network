import { ReactNode } from "react";
import { AbsoluteFill, Audio, staticFile, useCurrentFrame, interpolate } from "remotion";
import { Captions } from "./Captions";
import { FilmBeat } from "../timing";

interface SceneShellProps {
  beat: FilmBeat;
  children: ReactNode;
  captions?: boolean;
  contentStyle?: React.CSSProperties;
}

export const SceneShell = ({ beat, children, captions = true, contentStyle }: SceneShellProps) => {
  const frame = useCurrentFrame();
  const fadeIn = interpolate(frame, [0, 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(frame, [beat.frames - 14, beat.frames], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const opacity = Math.min(fadeIn, fadeOut);

  return (
    <AbsoluteFill>
      <Audio src={staticFile(`audio/beat-${beat.id}.mp3`)} />
      <AbsoluteFill
        style={{
          opacity,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          ...contentStyle,
        }}
      >
        {children}
      </AbsoluteFill>
      {captions ? (
        <AbsoluteFill style={{ opacity }}>
          <Captions words={beat.words} />
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};
