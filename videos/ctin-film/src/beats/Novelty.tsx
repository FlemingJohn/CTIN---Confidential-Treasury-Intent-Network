import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { CheckIcon, CrossIcon } from "../components/icons";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont } from "../theme";

const rows = [
  { label: "Confidential netting to one trade", existing: true, ctin: true },
  { label: "Executes from your existing Safe", existing: false, ctin: true },
  { label: "Automated Safe-module execution", existing: false, ctin: true },
  { label: "Real auditor decryption access", existing: false, ctin: true },
  { label: "Signed compliance report", existing: false, ctin: true },
];

const LABEL_WIDTH = 760;
const COLUMN_WIDTH = 260;
const ROW_HEIGHT = 92;

export const Novelty = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const headerOpacity = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const tableWidth = LABEL_WIDTH + COLUMN_WIDTH * 2;
  const ctinColumnLeft = LABEL_WIDTH + COLUMN_WIDTH;

  return (
    <SceneShell beat={beat}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 52 }}>
        <div
          style={{
            fontFamily: displayFont,
            fontWeight: 700,
            fontSize: 68,
            color: colors.textPrimary,
            opacity: headerOpacity,
          }}
        >
          Existing tools vs CTIN
        </div>

        <div style={{ position: "relative", width: tableWidth }}>
          <div
            style={{
              position: "absolute",
              left: ctinColumnLeft,
              top: 0,
              width: COLUMN_WIDTH,
              height: ROW_HEIGHT * (rows.length + 1),
              border: `1.5px solid ${colors.ember}`,
              borderRadius: 16,
              boxShadow: "0 0 30px 4px rgba(255,107,26,0.22)",
              opacity: headerOpacity,
            }}
          />

          <div style={{ display: "flex", height: ROW_HEIGHT, alignItems: "center", opacity: headerOpacity }}>
            <div style={{ width: LABEL_WIDTH }} />
            <div style={{ width: COLUMN_WIDTH, textAlign: "center", fontFamily: monoFont, fontSize: 26, letterSpacing: 2, color: colors.textMuted }}>
              Existing
            </div>
            <div style={{ width: COLUMN_WIDTH, textAlign: "center", fontFamily: displayFont, fontWeight: 700, fontSize: 30, color: colors.ember }}>
              CTIN
            </div>
          </div>

          {rows.map((row, index) => {
            const start = 18 + index * 14;
            const appear = interpolate(frame, [start, start + 16], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            const pop = interpolate(frame, [start + 10, start + 24], [0, 1], {
              easing: Easing.out(Easing.cubic),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            });
            return (
              <div
                key={row.label}
                style={{
                  display: "flex",
                  height: ROW_HEIGHT,
                  alignItems: "center",
                  borderTop: `1px solid ${colors.obsidianBorder}`,
                  opacity: appear,
                  transform: `translateX(${interpolate(appear, [0, 1], [-24, 0])}px)`,
                }}
              >
                <div style={{ width: LABEL_WIDTH, fontFamily: monoFont, fontSize: 27, color: colors.textPrimary }}>
                  {row.label}
                </div>
                <div style={{ width: COLUMN_WIDTH, display: "flex", justifyContent: "center", transform: `scale(${pop})` }}>
                  {row.existing ? (
                    <CheckIcon size={34} color={colors.settled} />
                  ) : (
                    <CrossIcon size={34} color={colors.textMuted} />
                  )}
                </div>
                <div style={{ width: COLUMN_WIDTH, display: "flex", justifyContent: "center", transform: `scale(${pop})` }}>
                  {row.ctin ? (
                    <CheckIcon size={38} color={colors.ember} />
                  ) : (
                    <CrossIcon size={38} color={colors.textMuted} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </SceneShell>
  );
};
