import asyncio
import json
from pathlib import Path

import edge_tts

TICKS_PER_SECOND = 10_000_000
TAIL_PAD_SECONDS = 0.45


def attach_punctuation(words, text):
    position = 0
    for word in words:
        index = text.find(word["text"], position)
        if index == -1:
            continue
        end = index + len(word["text"])
        trailing = ""
        while end < len(text) and text[end] in '.,:;!?)"':
            trailing += text[end]
            end += 1
        word["text"] = word["text"] + trailing
        position = end
    return words


async def synthesize(text, voice, rate, output_path):
    words = []
    with output_path.open("wb") as audio:
        communicate = edge_tts.Communicate(text, voice, rate=rate, boundary="WordBoundary")
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                end = (chunk["offset"] + chunk["duration"]) / TICKS_PER_SECOND
                words.append({"text": chunk["text"], "start": round(start, 3), "end": round(end, 3)})
    return attach_punctuation(words, text)


async def main():
    project = Path(__file__).resolve().parent
    config = json.loads((project / "narration.json").read_text(encoding="utf-8"))
    audio_dir = project / "public" / "audio"
    audio_dir.mkdir(parents=True, exist_ok=True)

    voice = config["voice"]
    rate = config["rate"]
    out_beats = []
    for beat in config["beats"]:
        beat_id = beat["id"]
        output_path = audio_dir / f"beat-{beat_id}.mp3"
        words = await synthesize(beat["text"], voice, rate, output_path)
        duration = (words[-1]["end"] if words else 0.0) + TAIL_PAD_SECONDS
        out_beats.append(
            {"id": beat_id, "audioDurationSec": round(duration, 3), "words": words}
        )
        print(f"beat {beat_id}: {round(duration, 2)}s, {len(words)} words")

    beats_manifest = {"fps": config["fps"], "beats": out_beats}
    (project / "public" / "beats.json").write_text(
        json.dumps(beats_manifest, indent=2, ensure_ascii=True) + "\n", encoding="utf-8"
    )
    total = sum(beat["audioDurationSec"] for beat in out_beats)
    print(f"total narration: {round(total, 2)}s across {len(out_beats)} beats")

    demo_steps_path = project / "demo-steps.json"
    if demo_steps_path.exists():
        demo_config = json.loads(demo_steps_path.read_text(encoding="utf-8"))
        out_steps = []
        for step in demo_config["steps"]:
            step_id = step["id"]
            output_path = audio_dir / f"demo-{step_id}.mp3"
            words = await synthesize(step["text"], demo_config["voice"], demo_config["rate"], output_path)
            duration = (words[-1]["end"] if words else 0.0) + TAIL_PAD_SECONDS
            out_steps.append({"id": step_id, "audioDurationSec": round(duration, 3), "words": words})
            print(f"demo {step_id}: {round(duration, 2)}s, {len(words)} words")
        (project / "public" / "demo-steps.json").write_text(
            json.dumps({"fps": demo_config["fps"], "steps": out_steps}, indent=2, ensure_ascii=True) + "\n",
            encoding="utf-8",
        )


if __name__ == "__main__":
    asyncio.run(main())
