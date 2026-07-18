import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { VaultIcon, SwapIcon, DiamondIcon, ShieldIcon } from "../components/icons";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont } from "../theme";

const cards = [
  { Icon: VaultIcon, label: "DAO treasuries", note: "Rebalance without leaking strategy" },
  { Icon: SwapIcon, label: "Crypto funds", note: "Enter and exit size without front-running" },
  { Icon: DiamondIcon, label: "Stablecoin issuers", note: "Manage reserves confidentially" },
  { Icon: ShieldIcon, label: "Tokenized assets", note: "Privacy with on-demand compliance" },
];

export const UseCases = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const headlineOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell beat={beat}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 60 }}>
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
          Built for real treasuries.
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {cards.map((card, index) => {
            const start = 16 + index * 11;
            const appear = interpolate(frame, [start, start + 18], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={card.label}
                style={{
                  width: 340,
                  padding: "42px 32px",
                  backgroundColor: colors.obsidianPanel,
                  border: `1px solid ${colors.obsidianBorder}`,
                  borderRadius: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 20,
                  opacity: appear,
                  transform: `translateY(${interpolate(appear, [0, 1], [30, 0])}px)`,
                }}
              >
                <div style={{ color: colors.ember }}>
                  <card.Icon size={48} />
                </div>
                <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 34, color: colors.textPrimary }}>
                  {card.label}
                </div>
                <div style={{ fontFamily: monoFont, fontSize: 22, color: colors.textMuted, lineHeight: 1.45 }}>
                  {card.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};
