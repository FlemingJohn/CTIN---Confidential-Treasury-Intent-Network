import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { FlameMark } from "../components/FlameMark";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont, emberGradient } from "../theme";

const tags = ["NOX", "SAFE", "UNISWAP", "ETH SEPOLIA"];

export const Close = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const markScale = interpolate(frame, [0, 22], [0.85, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const wordmarkOpacity = interpolate(frame, [8, 28], [0, 1], { extrapolateRight: "clamp" });
  const taglineOpacity = interpolate(frame, [24, 46], [0, 1], { extrapolateRight: "clamp" });
  const tagsOpacity = interpolate(frame, [40, 62], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell beat={beat} captions={false}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 34 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 28, transform: `scale(${markScale})` }}>
          <FlameMark size={92} />
          <div
            style={{
              fontFamily: displayFont,
              fontWeight: 700,
              fontSize: 128,
              letterSpacing: 4,
              backgroundImage: emberGradient,
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
              opacity: wordmarkOpacity,
            }}
          >
            CTIN
          </div>
        </div>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 500,
            fontSize: 46,
            color: colors.textPrimary,
            textAlign: "center",
            maxWidth: 1300,
            lineHeight: 1.35,
            opacity: taglineOpacity,
          }}
        >
          Confidential treasury execution on your existing Safe, with built-in auditor compliance.
        </div>
        <div style={{ display: "flex", gap: 20, opacity: tagsOpacity }}>
          {tags.map((tag) => (
            <div
              key={tag}
              style={{
                fontFamily: monoFont,
                fontSize: 26,
                letterSpacing: 3,
                color: colors.textMuted,
                border: `1px solid ${colors.obsidianBorder}`,
                borderRadius: 999,
                padding: "12px 28px",
              }}
            >
              {tag}
            </div>
          ))}
        </div>
        <div
          style={{
            fontFamily: monoFont,
            fontSize: 24,
            letterSpacing: 4,
            color: colors.textMuted,
            opacity: tagsOpacity,
          }}
        >
          Built by Fleming John
        </div>
      </div>
    </SceneShell>
  );
};
