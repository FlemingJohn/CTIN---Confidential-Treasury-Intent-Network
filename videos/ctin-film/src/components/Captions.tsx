import { useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { useMemo } from "react";
import { CaptionWord } from "../timing";
import { colors, monoFont } from "../theme";

interface CaptionLine {
  words: CaptionWord[];
  start: number;
  end: number;
}

const buildLines = (words: CaptionWord[]): CaptionLine[] => {
  const lines: CaptionLine[] = [];
  let current: CaptionWord[] = [];
  for (const word of words) {
    current.push(word);
    const endsClause = /[.,:;!?]$/.test(word.text);
    if (endsClause || current.length >= 7) {
      lines.push({ words: current, start: current[0].start, end: current[current.length - 1].end });
      current = [];
    }
  }
  if (current.length > 0) {
    lines.push({ words: current, start: current[0].start, end: current[current.length - 1].end });
  }
  return lines;
};

export const Captions = ({ words }: { words: CaptionWord[] }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const time = frame / fps;
  const lines = useMemo(() => buildLines(words), [words]);
  if (lines.length === 0) {
    return null;
  }

  let activeIndex = 0;
  for (let index = 0; index < lines.length; index += 1) {
    if (lines[index].start <= time + 0.15) {
      activeIndex = index;
    }
  }
  const line = lines[activeIndex];
  const appear = interpolate(time, [line.start - 0.25, line.start + 0.15], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 96,
        display: "flex",
        justifyContent: "center",
        padding: "0 160px",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          textAlign: "center",
          fontFamily: monoFont,
          fontSize: 34,
          lineHeight: 1.5,
          letterSpacing: 0.5,
          backgroundColor: "rgba(5,5,5,0.55)",
          border: `1px solid ${colors.obsidianBorder}`,
          borderRadius: 14,
          padding: "18px 28px",
          opacity: appear,
          transform: `translateY(${interpolate(appear, [0, 1], [12, 0])}px)`,
          whiteSpace: "pre-wrap",
        }}
      >
        {line.words.map((word, index) => {
          const spoken = word.end <= time;
          const active = word.start <= time && time < word.end;
          const color = active ? colors.glow : spoken ? colors.textPrimary : colors.textMuted;
          return (
            <span key={index} style={{ color }}>
              {index > 0 ? " " : ""}
              {word.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
