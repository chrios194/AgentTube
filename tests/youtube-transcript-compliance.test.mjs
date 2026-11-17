import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

test("server action fails closed and has no unofficial transcript or storage client", () => {
  const source = read("src/actions/GetYoutubeTranscript.ts");
  assert.match(source, /YOUTUBE_TRANSCRIPT_UNAVAILABLE/);
  assert.doesNotMatch(source, /youtubei\.js|Innertube|ConvexHttpClient|\.getTranscript\(/);
});

test("AI transcript tool returns a blocked result without invoking the server action", () => {
  const source = read("src/ai-tools/FetchTranscript.ts");
  assert.match(source, /YOUTUBE_TRANSCRIPT_UNAVAILABLE/);
  assert.doesNotMatch(source, /GetYoutubeTranscript|youtubei\.js|Innertube/);
});

test("chat route neither imports nor exposes transcript retrieval", () => {
  const source = read("src/app/api/chat/route.ts");
  assert.doesNotMatch(source, /FetchTranscript|fetchTranscript:/);
  assert.match(source, /transcripts are temporarily unavailable/i);
});

test("transcription UI does not invoke the old server action", () => {
  const source = read("src/components/features/Transcription.tsx");
  assert.doesNotMatch(source, /GetYoutubeTranscript|useEffect|youtubei\.js|Innertube/);
  assert.match(source, /Transcription temporarily unavailable/);
});
