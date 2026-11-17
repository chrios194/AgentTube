# AgentTube YouTube API Client compliance — 2026-11-18

## Application boundary

The source-identified API Client is the separate Next.js/React AgentTube video-analysis and content-assistant application in `chrios194/AgentTube`. It has its own user authentication, dashboard, subscription features, Convex backend, and video-analysis tools. It is distinct from the Node.js/Express `chrios194/youtube-automation-agent` publisher application.

The default branch's `src/actions/GetVideoDetails.ts` constructs a YouTube Data API v3 client with `YOUTUBE_API_KEY` and calls `videos.list` and `channels.list`. This is an actual API access boundary, not a channel or repository boundary. If this application continues to use YouTube API credentials after approval, it requires exactly one exclusive API Project for this application. It must not share the publisher application's project or credentials, and project count is not per channel.

## Child-directed assessment

The inspected README describes a video-analysis/content-assistant product with creator-oriented account and subscription features. No child-directed product features or child-targeted positioning were identified in the inspected text. This is only a provisional source observation, not a final classification.

Final status remains **not assessed** pending:
- product-owner attestation;
- live dashboard, onboarding, visual/audio, marketing and advertising review;
- reliable user-age and audience evidence;
- review of any product component that targets or directs itself to children.

A channel's audience and an individual video's Made for Kids designation are separate from the API Client's product-level child-directed status.

## Draft-branch controls

- Transcript retrieval through `youtubei.js` / Innertube is disabled in this draft; the dependency is removed from the draft branch.
- Official YouTube Data API metadata access is also fail-closed in this draft. The gate is hard-disabled in code, has no environment-variable bypass, and returns before dynamically loading `googleapis` or reading `YOUTUBE_API_KEY`.
- The chat route returns HTTP 503 for the compliance block, and the metadata panel explains that access is paused.
- The README no longer instructs operators to create a project or set a YouTube API key.
- User-provided metadata or transcript text may be used only when the user owns it or is permitted to use it.

## Provisioning and release state

- API Client boundary: identified from implemented source.
- Deployment identity: unverified.
- Child-directed status: not assessed.
- API Project: none assigned.
- API key/OAuth credentials created by this remediation: none.
- Existing deployment environment variables: not inspected; any pre-existing key must remain unused while the gate is false.
- Compliance audit/approval: not completed.
- Publishing: not implemented or authorized by this application.

Do not create a Google Cloud API Project, API key, OAuth credential, user token, or enable YouTube API access until the central AIOS registry records the final boundary and child-directed assessment, any required compliance audit/approval, one exclusive project for this application, a least-privilege access review, and documented data-retention/deletion controls.

## Official policy references

- https://developers.google.com/youtube/terms/developer-policies/
- https://developers.google.com/youtube/terms/developer-policies-guide
