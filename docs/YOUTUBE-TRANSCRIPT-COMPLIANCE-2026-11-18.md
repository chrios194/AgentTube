# YouTube transcript compliance — 2026-11-18

## Decision

Transcript retrieval is disabled in the AgentTube analysis application. The previous `GetYoutubeTranscript` action used `youtubei.js` / Innertube to retrieve transcript content outside the official YouTube API. Google policy prohibits directly or indirectly scraping YouTube Applications or using non-YouTube-API technology to access or retrieve YouTube API Data:

https://developers.google.com/youtube/terms/developer-policies/

## Changes in this draft

- The server action fails closed with `YOUTUBE_TRANSCRIPT_UNAVAILABLE`; it no longer imports Innertube or writes new transcript data to Convex.
- The Convex transcript read queries and write mutation also fail closed with `YOUTUBE_TRANSCRIPT_STORAGE_DISABLED`. This closes the direct Convex-function bypass left by disabling only the Next.js action and UI. The existing per-record delete mutation is retained; this change does not enumerate, read, or delete existing records.
- The AI transcript tool returns a blocked result and does not call the server action.
- The chat route no longer exposes the transcript tool and tells the model not to attempt transcript retrieval.
- The Transcription UI displays an explicit disabled notice and does not invoke the server action.
- A Node built-in test suite checks that these runtime paths do not reintroduce `youtubei.js`/Innertube calls and that the package/lockfile no longer declare the dependency.
- A small GitHub Actions workflow is added for future pushes and pull requests to `master`.

## Remaining work

- The `youtubei.js` dependency was removed from `package.json` and pruned from the lockfile. CI must verify `npm ci` accepts the updated lockfile.
- Audit existing Convex transcript records for retention/deletion obligations and document user deletion handling. Existing records remain uninspected and untouched because the deployed Convex environment is not connected and no data-deletion approval was provided.
- If transcripts are restored, use only an official, authorized captions workflow where the current user has the required rights. Do not use an API key to retrieve captions for arbitrary third-party videos.
- The official `captions.list` method returns caption-track metadata, not caption text; it requires OAuth with `youtube.force-ssl` or `youtubepartner` and costs 50 quota units: https://developers.google.com/youtube/data/reference/rest/v3/captions/list
- The official `captions.download` method returns the caption track, costs 200 quota units, and explicitly requires the authorized user to have permission to edit the video: https://developers.google.com/youtube/data/reference/rest/v3/captions/download
- Therefore the official captions API is not a general replacement for downloading transcripts from arbitrary public videos. Keep the feature disabled until a user-authorized, rights-checked workflow is implemented and the app's API Client review is complete.
- This analysis application is a separate API Client from `youtube-automation-agent`; if it continues using YouTube Data API credentials, it needs its own exclusive API Project. No project or API key is provisioned by this change.
- Final child-directed assessment and deployment identity remain pending owner attestation and audience/marketing evidence.

This is a draft compliance fix; do not merge or enable any YouTube API credentials/publishing without the central AIOS Core approval gates.
