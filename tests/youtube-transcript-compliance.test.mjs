import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { getYouTubeApiAccessState } = require("../src/lib/youtube-api-access.js");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (relative) => readFileSync(path.join(root, relative), "utf8");

test("server action fails closed and has no unofficial transcript or storage client", () => {
  const source = read("src/actions/GetYoutubeTranscript.ts");
  assert.match(source, /YOUTUBE_TRANSCRIPT_UNAVAILABLE/);
  assert.doesNotMatch(source, /from\s+["\']youtubei\.js["\']|Innertube\.create|\.getTranscript\(|ConvexHttpClient/);
});

test("Convex transcript queries and mutations are fail-closed, not just the UI/server action", () => {
  const source = read("convex/transcript.ts");
  assert.equal((source.match(/YOUTUBE_TRANSCRIPT_STORAGE_DISABLED/g) || []).length, 3);
  assert.equal(source.includes('.query("transcript")'), false);
  assert.equal(source.includes('.insert("transcript"'), false);
  assert.ok(source.includes("export const deleteTranscript = mutation"));
  assert.ok(source.includes("transcript.userId !== args.userId"));
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
test("unofficial transcript client is removed from the direct dependency manifest and lockfile", () => {
  const manifest = JSON.parse(read("package.json"));
  const lock = JSON.parse(read("package-lock.json"));
  assert.equal(manifest.dependencies?.["youtubei.js"], undefined);
  assert.equal(lock.packages?.[""]?.dependencies?.["youtubei.js"], undefined);
  assert.equal(lock.packages?.["node_modules/youtubei.js"], undefined);
});


test("official YouTube Data API metadata access remains fail-closed", () => {
  const state = getYouTubeApiAccessState();
  assert.equal(state.allowed, false);
  assert.equal(state.code, "YOUTUBE_API_COMPLIANCE_BLOCKED");
  assert.match(state.message, /child-directed assessment/i);
});

test("metadata action checks compliance before dynamically loading googleapis", () => {
  const source = read("src/actions/GetVideoDetails.ts");
  const gate = source.indexOf("if (!access.allowed)");
  const apiImport = source.indexOf('await import("googleapis")');
  assert.ok(gate >= 0, "metadata action must check the compliance gate");
  assert.ok(apiImport > gate, "Google API client must load only after the gate");
  assert.doesNotMatch(source, /import\\s+\\{\\s*google\\s*\\}\\s+from\\s+["']googleapis["']/);
});

test("chat route returns 503 for a compliance-blocked metadata request", () => {
  const source = read("src/app/api/chat/route.ts");
  assert.match(source, /YOUTUBE_API_COMPLIANCE_BLOCKED/);
  assert.ok(source.includes("{ status: complianceBlocked ? 503 : 404 }"));
});

test("metadata panel displays the compliance explanation instead of a generic error", () => {
  const source = read("src/components/features/YoutubeVideoDetails.tsx");
  assert.match(source, /role="alert"/);
  assert.doesNotMatch(source, /Error is here/);
});

test("README does not instruct users to provision a YouTube API key", () => {
  const source = read("README.md");
  assert.match(source, /Do not create a Google Cloud project or set YOUTUBE_API_KEY/i);
  assert.doesNotMatch(source, /YOUTUBE_API_KEY=<your_youtube_api_key>/);
});
