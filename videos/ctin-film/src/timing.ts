import beatsManifest from "../public/beats.json";

export interface CaptionWord {
  text: string;
  start: number;
  end: number;
}

export interface FilmBeat {
  id: string;
  frames: number;
  audioDurationSec: number;
  words: CaptionWord[];
}

export const FPS = beatsManifest.fps;

export const DEMO_CLIP_SECONDS = 64.52;

const tailPadSeconds: Record<string, number> = {
  hook: 0.7,
  problem: 0.6,
  solution: 0.7,
  architecture: 0.7,
  demo: 0,
  proof: 0.8,
  close: 1.2,
};

export const beats: FilmBeat[] = beatsManifest.beats.map((beat) => {
  const baseSeconds =
    beat.id === "demo"
      ? Math.max(DEMO_CLIP_SECONDS, beat.audioDurationSec)
      : beat.audioDurationSec;
  const pad = tailPadSeconds[beat.id] ?? 0.6;
  return {
    id: beat.id,
    frames: Math.ceil((baseSeconds + pad) * FPS),
    audioDurationSec: beat.audioDurationSec,
    words: beat.words as CaptionWord[],
  };
});

export const totalFrames = beats.reduce((sum, beat) => sum + beat.frames, 0);
