import {
  AbsoluteFill,
  Sequence,
  Audio,
  OffthreadVideo,
  staticFile,
  useCurrentFrame,
  interpolate,
} from "remotion";
import { Captions } from "../components/Captions";
import { FilmBeat, demoSteps } from "../timing";
import { colors, monoFont } from "../theme";

export const Demo = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const dotOpacity = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame * 0.2));
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
    <AbsoluteFill style={{ opacity }}>
      <div style={{ position: "relative", width: "100%", height: "100%" }}>
        <div
          style={{
            position: "absolute",
            left: 160,
            top: 64,
            width: 1600,
            height: 900,
            borderRadius: 20,
            overflow: "hidden",
            border: `1.5px solid ${colors.ember}`,
            boxShadow: "0 0 60px 6px rgba(255,107,26,0.28)",
          }}
        >
          <OffthreadVideo
            src={staticFile("demo.mp4")}
            muted
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
        <div
          style={{
            position: "absolute",
            left: 188,
            top: 92,
            display: "flex",
            alignItems: "center",
            gap: 12,
            backgroundColor: "rgba(5,5,5,0.7)",
            border: `1px solid ${colors.obsidianBorder}`,
            borderRadius: 999,
            padding: "10px 20px",
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              backgroundColor: colors.ember,
              boxShadow: `0 0 10px ${colors.ember}`,
              opacity: dotOpacity,
            }}
          />
          <span style={{ fontFamily: monoFont, fontSize: 24, letterSpacing: 3, color: colors.textPrimary }}>
            LIVE · ETH SEPOLIA
          </span>
        </div>
      </div>

      {demoSteps.map((step) => (
        <Sequence
          key={step.id}
          from={step.startFrame}
          durationInFrames={step.durationFrames}
          name={step.id}
        >
          <Audio src={staticFile(`audio/demo-${step.id}.mp3`)} />
          <Captions words={step.words} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};
