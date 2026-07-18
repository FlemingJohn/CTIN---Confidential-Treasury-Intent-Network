import beatsManifest from "../public/beats.json";
import demoStepsManifest from "../public/demo-steps.json";
import demoTiming from "../public/demo-timing.json";

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

export interface DemoStep {
  id: string;
  startFrame: number;
  durationFrames: number;
  audioDurationSec: number;
  words: CaptionWord[];
}

export const FPS = beatsManifest.fps;

export const demoClipFrames = Math.round(demoTiming.clipDurationSec * FPS);

export const demoSteps: DemoStep[] = demoTiming.steps.map((step, index) => {
  const manifestStep = demoStepsManifest.steps[index];
  return {
    id: step.id,
    startFrame: Math.round(step.startSec * FPS),
    durationFrames: Math.round(step.durationSec * FPS),
    audioDurationSec: manifestStep ? manifestStep.audioDurationSec : 0,
    words: manifestStep ? (manifestStep.words as CaptionWord[]) : [],
  };
});

const tailPadSeconds: Record<string, number> = {
  hook: 0.7,
  problem: 0.6,
  solution: 0.7,
  architecture: 0.7,
  proof: 0.8,
  novelty: 0.8,
  usecases: 0.8,
  close: 1.2,
};

export const beats: FilmBeat[] = beatsManifest.beats.map((beat) => {
  if (beat.id === "demo") {
    return {
      id: beat.id,
      frames: demoClipFrames,
      audioDurationSec: beat.audioDurationSec,
      words: beat.words as CaptionWord[],
    };
  }
  const pad = tailPadSeconds[beat.id] ?? 0.6;
  return {
    id: beat.id,
    frames: Math.ceil((beat.audioDurationSec + pad) * FPS),
    audioDurationSec: beat.audioDurationSec,
    words: beat.words as CaptionWord[],
  };
});

export const totalFrames = beats.reduce((sum, beat) => sum + beat.frames, 0);
