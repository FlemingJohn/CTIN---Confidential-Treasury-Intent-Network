import { useCurrentFrame, interpolate, Easing } from "remotion";
import { SceneShell } from "../components/SceneShell";
import { FlameMark } from "../components/FlameMark";
import { LockIcon } from "../components/icons";
import { FilmBeat } from "../timing";
import { colors, displayFont, monoFont } from "../theme";

const STAGE_WIDTH = 1720;
const STAGE_HEIGHT = 610;

const intents = [
  { institution: "Institution A", direction: "BUY", amount: "400", centerY: 75 },
  { institution: "Institution B", direction: "SELL", amount: "350", centerY: 305 },
  { institution: "Institution C", direction: "BUY", amount: "100", centerY: 535 },
];

const noxCenter = { x: 850, y: 305 };
const resultCenter = { x: 1480, y: 305 };

export const Solution = ({ beat }: { beat: FilmBeat }) => {
  const frame = useCurrentFrame();
  const flowIn = interpolate(frame, [72, 104], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const flowOut = interpolate(frame, [108, 132], [0, 1], {
    easing: Easing.inOut(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const noxGlow = interpolate(frame, [80, 120], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const encrypt = interpolate(frame, [50, 70], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const resultReveal = interpolate(frame, [120, 152], [0, 1], {
    easing: Easing.out(Easing.cubic),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <SceneShell beat={beat}>
      <div style={{ position: "relative", width: STAGE_WIDTH, height: STAGE_HEIGHT }}>
        <svg
          width={STAGE_WIDTH}
          height={STAGE_HEIGHT}
          style={{ position: "absolute", inset: 0 }}
        >
          {intents.map((intent, index) => {
            const x1 = 430;
            const y1 = intent.centerY;
            const x2 = noxCenter.x - 150;
            const y2 = noxCenter.y;
            const dotX = x1 + (x2 - x1) * flowIn;
            const dotY = y1 + (y2 - y1) * flowIn;
            return (
              <g key={index}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={colors.obsidianBorder} strokeWidth={2} />
                <line
                  x1={x1}
                  y1={y1}
                  x2={dotX}
                  y2={dotY}
                  stroke={colors.ember}
                  strokeWidth={2.5}
                  opacity={0.8}
                />
                <circle cx={dotX} cy={dotY} r={flowIn > 0 && flowIn < 1 ? 6 : 0} fill={colors.glow} />
              </g>
            );
          })}
          <line
            x1={noxCenter.x + 150}
            y1={noxCenter.y}
            x2={resultCenter.x - 200}
            y2={resultCenter.y}
            stroke={colors.obsidianBorder}
            strokeWidth={2}
          />
          <line
            x1={noxCenter.x + 150}
            y1={noxCenter.y}
            x2={noxCenter.x + 150 + (resultCenter.x - 200 - (noxCenter.x + 150)) * flowOut}
            y2={noxCenter.y}
            stroke={colors.ember}
            strokeWidth={3}
          />
        </svg>

        {intents.map((intent, index) => {
          const start = 6 + index * 10;
          const appear = interpolate(frame, [start, start + 18], [0, 1], {
            easing: Easing.out(Easing.cubic),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          const isBuy = intent.direction === "BUY";
          return (
            <div
              key={index}
              style={{
                position: "absolute",
                left: 0,
                top: intent.centerY - 66,
                width: 430,
                height: 132,
                padding: "20px 26px",
                backgroundColor: colors.obsidianPanel,
                border: `1px solid ${colors.obsidianBorder}`,
                borderRadius: 16,
                boxSizing: "border-box",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: 12,
                opacity: appear,
                transform: `translateX(${interpolate(appear, [0, 1], [-30, 0])}px)`,
              }}
            >
              <div style={{ fontFamily: monoFont, fontSize: 22, letterSpacing: 2, color: colors.textMuted }}>
                {intent.institution}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                <span
                  style={{
                    fontFamily: monoFont,
                    fontWeight: 700,
                    fontSize: 26,
                    color: isBuy ? colors.ember : colors.confidential,
                    letterSpacing: 2,
                  }}
                >
                  {intent.direction}
                </span>
                <div style={{ position: "relative", height: 40, flex: 1 }}>
                  <span
                    style={{
                      position: "absolute",
                      fontFamily: displayFont,
                      fontWeight: 700,
                      fontSize: 38,
                      color: colors.textPrimary,
                      opacity: 1 - encrypt,
                    }}
                  >
                    {intent.amount}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      color: colors.glow,
                      opacity: encrypt,
                    }}
                  >
                    <LockIcon size={26} color={colors.glow} />
                    <span style={{ fontFamily: monoFont, fontSize: 26 }}>encrypted</span>
                  </span>
                </div>
              </div>
            </div>
          );
        })}

        <div
          style={{
            position: "absolute",
            left: noxCenter.x - 150,
            top: noxCenter.y - 110,
            width: 300,
            height: 220,
            borderRadius: 24,
            backgroundColor: colors.obsidianRaised,
            border: `1.5px solid ${colors.ember}`,
            boxShadow: `0 0 ${40 * noxGlow}px ${8 * noxGlow}px rgba(255,107,26,${0.45 * noxGlow})`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <FlameMark size={72} />
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 34, color: colors.textPrimary }}>
            NOX
          </div>
          <div style={{ fontFamily: monoFont, fontSize: 22, letterSpacing: 3, color: colors.textMuted }}>
            NET IN TEE
          </div>
        </div>

        <div
          style={{
            position: "absolute",
            left: resultCenter.x - 240,
            top: resultCenter.y - 120,
            width: 480,
            height: 240,
            borderRadius: 24,
            backgroundColor: colors.obsidianPanel,
            border: `1.5px solid ${colors.settled}`,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            opacity: resultReveal,
            transform: `scale(${interpolate(resultReveal, [0, 1], [0.9, 1])})`,
          }}
        >
          <div style={{ fontFamily: monoFont, fontSize: 24, letterSpacing: 4, color: colors.textMuted }}>
            NET RESIDUAL
          </div>
          <div style={{ fontFamily: displayFont, fontWeight: 700, fontSize: 96, color: colors.ember, lineHeight: 1 }}>
            BUY 150
          </div>
          <div style={{ fontFamily: monoFont, fontSize: 26, color: colors.textMuted }}>
            executed on Uniswap
          </div>
        </div>
      </div>
    </SceneShell>
  );
};
