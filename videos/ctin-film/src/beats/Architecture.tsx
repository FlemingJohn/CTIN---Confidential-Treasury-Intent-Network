import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { FlameMark } from "../components/FlameMark";
import { UserIcon, VaultIcon, PlugIcon, SwapIcon } from "../components/icons";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont } from "../theme";

const nodes = [
  { key: "signer", label: "Signer", render: (c: string) => <UserIcon size={46} color={c} /> },
  { key: "safe", label: "Safe", render: (c: string) => <VaultIcon size={46} color={c} /> },
  { key: "module", label: "Safe Module", render: (c: string) => <PlugIcon size={46} color={c} /> },
  { key: "nox", label: "Nox", render: () => <FlameMark size={46} /> },
  { key: "uniswap", label: "Uniswap", render: (c: string) => <SwapIcon size={46} color={c} /> },
];

const badges = ["Unmodified", "Funds stay in Safe", "No forks"];

export const Architecture = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const badgesOpacity = interpolate(frame, [140, 165], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <SceneShell beat={beat}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 70 }}>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 64,
            color: colors.textPrimary,
            textAlign: "center",
            opacity: interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" }),
          }}
        >
          It runs on the tools you already use.
        </div>

        <div style={{ display: "flex", alignItems: "center" }}>
          {nodes.map((node, index) => {
            const nodeStart = 12 + index * 16;
            const appear = interpolate(frame, [nodeStart, nodeStart + 16], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const isNox = node.key === "nox";
            const iconColor = isNox ? colors.ember : colors.ember;
            return (
              <div key={node.key} style={{ display: "flex", alignItems: "center" }}>
                {index > 0 ? (
                  <div style={{ width: 78, height: 2, position: "relative", margin: "0 6px" }}>
                    <div style={{ position: "absolute", inset: 0, backgroundColor: colors.obsidianBorder }} />
                    <div
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        height: 2,
                        width: `${interpolate(frame, [nodeStart - 8, nodeStart + 6], [0, 100], {
                          extrapolateLeft: "clamp",
                          extrapolateRight: "clamp",
                        })}%`,
                        backgroundColor: colors.ember,
                        boxShadow: `0 0 8px ${colors.ember}`,
                      }}
                    />
                  </div>
                ) : null}
                <div
                  style={{
                    width: 190,
                    height: 190,
                    borderRadius: 20,
                    backgroundColor: colors.obsidianPanel,
                    border: `1.5px solid ${isNox ? colors.ember : colors.obsidianBorder}`,
                    boxShadow: isNox ? `0 0 30px 4px rgba(255,107,26,0.35)` : "none",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 20,
                    opacity: appear,
                    transform: `translateY(${interpolate(appear, [0, 1], [24, 0])}px)`,
                  }}
                >
                  <div style={{ color: iconColor }}>{node.render(iconColor)}</div>
                  <div style={{ fontFamily: monoFont, fontSize: 26, color: colors.textPrimary, letterSpacing: 1 }}>
                    {node.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ display: "flex", gap: 24, opacity: badgesOpacity }}>
          {badges.map((badge) => (
            <div
              key={badge}
              style={{
                fontFamily: monoFont,
                fontSize: 26,
                color: colors.glow,
                border: `1px solid ${colors.obsidianBorder}`,
                borderRadius: 999,
                padding: "12px 26px",
                letterSpacing: 1,
              }}
            >
              {badge}
            </div>
          ))}
        </div>
      </div>
    </SceneShell>
  );
};
