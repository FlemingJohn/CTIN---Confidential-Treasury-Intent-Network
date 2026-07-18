import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CheckIcon } from "../components/icons";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont } from "../theme";

const rows = [
  { label: "openBatch", detail: "0x7c6fb9…969cae" },
  { label: "submitIntent", detail: "0x4b6777…25ab3d" },
  { label: "settleBatch", detail: "0xaa9b08…7b95af8" },
  { label: "decrypt", detail: "400 ETH, owner only" },
];

export const Proof = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const headlineOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const footerOpacity = interpolate(frame, [150, 175], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell beat={beat}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 68,
            color: colors.textPrimary,
            textAlign: "center",
            opacity: headlineOpacity,
          }}
        >
          Live on Ethereum Sepolia. Not a mock.
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, width: 980 }}>
          {rows.map((row, index) => {
            const start = 20 + index * 16;
            const appear = interpolate(frame, [start, start + 16], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 22,
                  padding: "22px 30px",
                  backgroundColor: colors.obsidianPanel,
                  border: `1px solid ${colors.obsidianBorder}`,
                  borderRadius: 14,
                  opacity: appear,
                  transform: `translateX(${interpolate(appear, [0, 1], [-24, 0])}px)`,
                }}
              >
                <div style={{ color: colors.settled }}>
                  <CheckIcon size={30} color={colors.settled} />
                </div>
                <span style={{ fontFamily: monoFont, fontWeight: 700, fontSize: 30, color: colors.textPrimary, width: 240 }}>
                  {row.label}
                </span>
                <span style={{ fontFamily: monoFont, fontSize: 28, color: colors.textMuted }}>{row.detail}</span>
              </div>
            );
          })}
        </div>
        <div style={{ fontFamily: monoFont, fontSize: 26, letterSpacing: 2, color: colors.glow, opacity: footerOpacity }}>
          verify on sepolia.etherscan.io
        </div>
      </div>
    </SceneShell>
  );
};
