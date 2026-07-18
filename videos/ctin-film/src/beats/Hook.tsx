import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { FlameMark } from "../components/FlameMark";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont, emberGradient } from "../theme";

export const Hook = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const markScale = interpolate(frame, [0, 22], [0.82, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const markOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const titleOpacity = interpolate(frame, [12, 32], [0, 1], { extrapolateRight: "clamp" });
  const titleY = interpolate(frame, [12, 32], [26, 0], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const tagOpacity = interpolate(frame, [28, 48], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell beat={beat}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 30 }}>
        <div style={{ opacity: markOpacity, transform: `scale(${markScale})` }}>
          <FlameMark size={150} />
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 168,
            letterSpacing: 6,
            lineHeight: 1,
            backgroundImage: emberGradient,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            color: "transparent",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          CTIN
        </div>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 34,
            letterSpacing: 8,
            textTransform: "uppercase",
            color: colors.textMuted,
            opacity: tagOpacity,
          }}
        >
          Confidential Treasury Intent Network
        </div>
      </div>
    </SceneShell>
  );
};
