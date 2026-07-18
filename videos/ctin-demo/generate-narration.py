import asyncio
import json
from pathlib import Path

import edge_tts

VOICE = "en-US-AndrewMultilingualNeural"
RATE = "-4%"
TICKS_PER_SECOND = 10_000_000


async def main() -> None:
    project = Path(__file__).resolve().parent
    text = (project / "narration.txt").read_text(encoding="utf-8").strip()
    words: list[dict[str, object]] = []

    with (project / "narration.mp3").open("wb") as audio:
        communicate = edge_tts.Communicate(
            text, VOICE, rate=RATE, boundary="WordBoundary"
        )
        async for chunk in communicate.stream():
            if chunk["type"] == "audio":
                audio.write(chunk["data"])
            elif chunk["type"] == "WordBoundary":
                start = chunk["offset"] / TICKS_PER_SECOND
                end = (chunk["offset"] + chunk["duration"]) / TICKS_PER_SECOND
                words.append({"text": chunk["text"], "start": start, "end": end})

    (project / "transcript.json").write_text(
        json.dumps(words, indent=2, ensure_ascii=True) + "\n",
        encoding="utf-8",
    )


if __name__ == "__main__":
    asyncio.run(main())
