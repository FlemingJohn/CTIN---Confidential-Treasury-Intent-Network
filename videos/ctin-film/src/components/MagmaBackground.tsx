import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { useMemo } from "react";
import { colors, fissureGradient } from "../theme";
import { createEmbers } from "../rng";

export const MagmaBackground = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const embers = useMemo(() => createEmbers(130, width, height), [width, height]);

  return (
    <AbsoluteFill style={{ backgroundColor: colors.obsidianBase }}>
      <AbsoluteFill style={{ backgroundImage: fissureGradient }} />
      {embers.map((ember, index) => {
        const x = ember.baseX + Math.sin(frame * ember.driftSpeed + ember.phase) * ember.driftAmplitude;
        const travelled = ember.baseY - frame * ember.riseSpeed;
        const y = ((travelled % height) + height) % height;
        const pulse = 0.28 + 0.55 * (0.5 + 0.5 * Math.sin(frame * ember.pulseSpeed + ember.phase));
        return (
          <div
            key={index}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: ember.size,
              height: ember.size,
              borderRadius: "50%",
              backgroundColor: ember.color,
              boxShadow: `0 0 ${ember.size * 3}px ${ember.size}px ${ember.color}`,
              opacity: pulse,
            }}
          />
        );
      })}
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(to bottom, rgba(5,5,5,0.55) 0%, rgba(5,5,5,0) 22%, rgba(5,5,5,0) 70%, rgba(5,5,5,0.65) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
