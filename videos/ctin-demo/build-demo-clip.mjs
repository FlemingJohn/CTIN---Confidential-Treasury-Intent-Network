import { execFileSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const here = path.dirname(fileURLToPath(import.meta.url));
const filmPublic = path.join(here, "../ctin-film/public");

function ffprobeDuration(file) {
  const output = execFileSync("ffprobe", [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=nw=1:nk=1",
    file,
  ]);
  return parseFloat(output.toString().trim());
}

const timeline = JSON.parse(
  fs.readFileSync(path.join(here, "capture", "timeline.json"), "utf8")
);
const recordingsDir = path.join(here, "capture", "recordings");
const webm = fs
  .readdirSync(recordingsDir)
  .filter((name) => name.endsWith(".webm"))
  .map((name) => path.join(recordingsDir, name))[0];

const rawDuration = ffprobeDuration(webm);
const deadRanges = timeline.deadRanges.slice().sort((a, b) => a[0] - b[0]);

const keepWindows = [];
let cursor = 0;
for (const [start, end] of deadRanges) {
  if (start > cursor) {
    keepWindows.push([cursor, start]);
  }
  cursor = Math.max(cursor, end);
}
if (cursor < rawDuration) {
  keepWindows.push([cursor, rawDuration]);
}

const selectExpression = keepWindows
  .map(([a, b]) => `between(t\\,${a}\\,${b})`)
  .join("+");
const filter = `select=${selectExpression},setpts=N/FRAME_RATE/TB`;

const outputDir = path.join(here, "output");
fs.mkdirSync(outputDir, { recursive: true });
const trimmedMp4 = path.join(outputDir, "ctin-demo-trimmed.mp4");

execFileSync("ffmpeg", [
  "-y",
  "-i",
  webm,
  "-vf",
  filter,
  "-an",
  "-c:v",
  "libx264",
  "-pix_fmt",
  "yuv420p",
  "-crf",
  "20",
  "-preset",
  "medium",
  "-movflags",
  "+faststart",
  trimmedMp4,
]);

const trimmedDuration = ffprobeDuration(trimmedMp4);

const mapToTrimmed = (rawTime) => {
  let subtract = 0;
  for (const [start, end] of deadRanges) {
    if (end <= rawTime) {
      subtract += end - start;
    } else if (start < rawTime && rawTime < end) {
      subtract += rawTime - start;
    }
  }
  return rawTime - subtract;
};

const steps = timeline.stepMarks.map((mark, index) => ({
  id: `step${index + 1}`,
  startSec: Number(mapToTrimmed(mark.t).toFixed(3)),
}));
for (let index = 0; index < steps.length; index += 1) {
  const end = index < steps.length - 1 ? steps[index + 1].startSec : trimmedDuration;
  steps[index].durationSec = Number((end - steps[index].startSec).toFixed(3));
}

const demoTiming = { clipDurationSec: Number(trimmedDuration.toFixed(3)), steps };
fs.mkdirSync(filmPublic, { recursive: true });
fs.writeFileSync(
  path.join(filmPublic, "demo-timing.json"),
  `${JSON.stringify(demoTiming, null, 2)}\n`
);
fs.copyFileSync(trimmedMp4, path.join(filmPublic, "demo.mp4"));

console.log(`trimmed ${rawDuration.toFixed(1)}s -> ${trimmedDuration.toFixed(1)}s`);
console.log(JSON.stringify(demoTiming, null, 2));
