function mulberry32(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface Ember {
  baseX: number;
  baseY: number;
  size: number;
  color: string;
  driftAmplitude: number;
  driftSpeed: number;
  phase: number;
  riseSpeed: number;
  pulseSpeed: number;
}

const emberColor = (sample: number): string => {
  if (sample > 0.9) {
    return "rgba(255, 215, 168, 0.95)";
  }
  if (sample > 0.5) {
    return "rgba(255, 107, 26, 0.85)";
  }
  return "rgba(225, 29, 42, 0.7)";
};

export function createEmbers(count: number, width: number, height: number): Ember[] {
  const random = mulberry32(20260718);
  const embers: Ember[] = [];
  for (let index = 0; index < count; index += 1) {
    embers.push({
      baseX: random() * width,
      baseY: random() * height,
      size: random() * 3 + 1.4,
      color: emberColor(random()),
      driftAmplitude: random() * 46 + 12,
      driftSpeed: random() * 0.03 + 0.008,
      phase: random() * Math.PI * 2,
      riseSpeed: random() * 0.55 + 0.25,
      pulseSpeed: random() * 0.05 + 0.02,
    });
  }
  return embers;
}
