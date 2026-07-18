import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { TargetIcon, CopyIcon, LayersIcon } from "../components/icons";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont } from "../theme";

const cards = [
  { Icon: TargetIcon, label: "Front-running", note: "Trades are seen before they settle" },
  { Icon: CopyIcon, label: "Copy-trading", note: "Strategies are mirrored instantly" },
  { Icon: LayersIcon, label: "Sandwich MEV", note: "$289M drained in H1 2025" },
];

export const Problem = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const headlineOpacity = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });

  return (
    <SceneShell beat={beat}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 64 }}>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 72,
            color: colors.textPrimary,
            textAlign: "center",
            opacity: headlineOpacity,
          }}
        >
          On-chain treasuries are glass houses.
        </div>
        <div style={{ display: "flex", gap: 40 }}>
          {cards.map((card, index) => {
            const start = 16 + index * 12;
            const appear = interpolate(frame, [start, start + 18], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const y = interpolate(appear, [0, 1], [30, 0]);
            return (
              <div
                key={card.label}
                style={{
                  width: 380,
                  padding: "44px 36px",
                  backgroundColor: colors.obsidianPanel,
                  border: `1px solid ${colors.obsidianBorder}`,
                  borderRadius: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 22,
                  opacity: appear,
                  transform: `translateY(${y}px)`,
                }}
              >
                <div style={{ color: colors.ember }}>
                  <card.Icon size={52} />
                </div>
                <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 42, color: colors.textPrimary }}>
                  {card.label}
                </div>
                <div style={{ fontFamily: monoFont, fontSize: 26, color: colors.textMuted, lineHeight: 1.4 }}>
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
