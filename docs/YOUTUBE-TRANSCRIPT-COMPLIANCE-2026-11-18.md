# YouTube transcript compliance — 2026-11-18

## Decision

Transcript retrieval is disabled in the AgentTube analysis application. The previous `GetYoutubeTranscript` action used `youtubei.js` / Innertube to retrieve transcript content outside the official YouTube API. Google policy prohibits directly or indirectly scraping YouTube Applications or using non-YouTube-API technology to access or retrieve YouTube API Data:

https://developers.google.com/youtube/terms/developer-policies/

## Changes in this draft

- The server action fails closed with `YOUTUBE_TRANSCRIPT_UNAVAILABLE`; it no longer imports Innertube or writes new transcript data to Convex.
- The AI transcript tool returns a blocked result and does not call the server action.
- The chat route no longer exposes the transcript tool and tells the model not to attempt transcript retrieval.
- The Transcription UI displays an explicit disabled notice and does not invoke the server action.
- A Node built-in test suite checks that these runtime paths do not reintroduce `youtubei.js`/Innertube calls.
- A small GitHub Actions workflow is added for future pushes and pull requests to `master`.

## Remaining work

- The `youtubei.js` package remains in the dependency manifest/lockfile but is no longer imported by the reviewed runtime paths; remove it after regenerating and validating the lockfile.
- Audit existing Convex transcript records for retention/deletion obligations and document user deletion handling.
- If transcripts are restored, use only an official, authorized captions workflow where the current user has the required rights. Do not use an API key to retrieve captions for arbitrary third-party videos.
- This analysis application is a separate API Client from `youtube-automation-agent`; if it continues using YouTube Data API credentials, it needs its own exclusive API Project. No project or API key is provisioned by this change.
- Final child-directed assessment and deployment identity remain pending owner attestation and audience/marketing evidence.

This is a draft compliance fix; do not merge or enable any YouTube API credentials/publishing without the central AIOS Core approval gates.
