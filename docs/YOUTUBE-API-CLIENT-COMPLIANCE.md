# AgentTube Video-Analysis API Client Compliance

Review date: 2026-11-17

## Product boundary

Repository: `chrios194/AgentTube`.

This is a distinct Next.js video-analysis/content-assistant application. The inspected implementation calls YouTube Data API v3 from `src/actions/GetVideoDetails.ts` using the `YOUTUBE_API_KEY` environment variable and the `googleapis` client. It requests public video and channel metadata with `videos.list` and `channels.list`.

The app is separate from `chrios194/youtube-automation-agent`, which implements a creator-automation publisher using Google OAuth, YouTube Data API write operations, and YouTube Analytics. These are distinct software repositories and API Client candidates. They must not share an API Project or credentials if confirmed as separate API Clients.

The actual deployed URL, deployment owner, final product name, and complete user-facing boundary have not been verified. The current product identity is therefore recorded as a code-level candidate, not an approved API Client.

## Child-directed assessment

Status: **NOT ASSESSED**.

The README describes an operator-facing video-analysis/content assistant, but a legal assessment requires review of the full UI, marketing, intended users, subject matter, language, visual/audio presentation, advertising, and reliable audience evidence. No classification is inferred from channel names or from the fact that videos may be analyzed.

If the API Client is child-directed, the applicable Google notification, COPPA/GDPR review, and no-personalized-ads controls must be documented before access is enabled.

## Project and credential controls

- Exactly one API Project for this actual API Client if it is approved.
- The API key must be exclusive to that project and this API Client.
- The key is never stored in this repository or compliance JSON; only its SHA-256 fingerprint may be recorded.
- No API Project or API key is provisioned by this PR.
- No per-channel projects or quota sharding.
- This app is read-only for YouTube Data API operations; write actions remain disabled.
- The project ID, owner API Client ID, key-project mapping, and key fingerprint must all match before API access can be enabled.

## Transcript path

`src/actions/GetYoutubeTranscript.ts` uses `youtubei.js`/InnerTube rather than the official YouTube Data API. This is not an approved substitute for API access. Its Terms-of-Service basis is not established here, so new transcript retrieval is disabled until a separate review with evidence is approved. Existing per-user cached transcripts remain readable.

## Current gate

The default configuration is fail-closed:

- Boundary review: pending.
- Child-directed assessment: not assessed.
- Compliance audit: not started.
- API Projects: 0.
- API keys: 0 provisioned by this PR.
- YouTube Data API access: disabled.
- InnerTube transcript access: disabled.

Official references:
- https://developers.google.com/youtube/terms/developer-policies
- https://developers.google.com/youtube/v3/docs/videos/list
- https://developers.google.com/youtube/v3/docs/channels/list
- https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions
