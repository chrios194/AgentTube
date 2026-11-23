# YouTube API Data handling — AgentTube — 2026-11-21

**Status:** blocked_unapproved; official YouTube API metadata access and transcript retrieval/storage disabled in this draft branch.  
**Deployment:** unverified. This document and CI are not proof of deployed controls.

## Required policy

- Other Authorized API Data and Non-Authorized API Data: refresh or delete within 30 calendar days.
- The limited Analytics API / Reporting API / statistics exception requires specific consent from an active user and rechecking both authorization and video existence every 30 calendar days.
- User-requested deletion: as soon as possible, within 7 calendar days.
- API Client revocation: revoke the token immediately and delete related Authorized API Data as soon as possible, within 7 calendar days.
- Google Security Settings revocation: delete all related API Data as soon as possible, within 30 calendar days.
- No unofficial scraping or undocumented YouTube Application endpoints, including youtubei.js/Innertube.
- captions.list is metadata-only; captions.download requires edit permission and is not a public-video transcript endpoint.
- Cross-account, cross-channel and cross-content-owner aggregation are all disabled. The central dashboard is limited to operational metadata.

Official policy: https://developers.google.com/youtube/terms/developer-policies/

## Source-level state on this draft branch

- `src/actions/GetYoutubeTranscript.ts` fails closed; it no longer imports youtubei.js/Innertube.
- `convex/transcript.ts` read/write queries and mutations fail closed. A per-record, user-checked delete mutation remains, but it is not account-wide deletion.
- `src/actions/GetVideoDetails.ts` checks the policy gate before dynamically importing googleapis or reading `YOUTUBE_API_KEY`.
- `src/lib/youtube-api-access.js` has an unconditional hard-disabled switch and lists unverified retention, Analytics rechecks, user deletion, immediate token revocation, 7-day client-revocation deletion, 30-day Google Security Settings deletion, cross-account/channel/content-owner aggregation, and exact deployment identity as blockers.
- `config/youtube-api-data-handling.json` records the 30/7/30-day deadlines, active-user consent requirement, and all deployed verification fields as `not_verified`.
- The default `master` branch still contains the previous unofficial transcript and Convex write path until the remediation PR is merged and deployed. No deployment or existing Convex data inventory was verified.

## Missing deployment evidence

- Complete deployed storage inventory and exact deployed environment/40-character commit SHA.
- Executed 30-day retention job and proof for Authorized and Non-Authorized API Data.
- Active-user consent plus Analytics authorization and video-existence rechecks every 30 days.
- End-to-end user-requested deletion across all deployed stores within 7 days.
- Immediate token revocation and end-to-end deletion within 7 days after API Client revocation.
- End-to-end deletion within 30 days after Google Security Settings revocation.
- Separate end-to-end evidence that cross-account, cross-channel and cross-content-owner aggregation are disabled.

No existing Convex transcript rows were enumerated or deleted. Do not claim that the draft's per-record deletion function proves user deletion or that source-level fail-closed code proves deployment.

## Provisioning decision

No API Project, API key, OAuth client, user token, API Data collection, API Data storage or publishing permission may be created or enabled until the actual API Client boundary, final child-directed assessment, required compliance audit/approval, and all deployed evidence above are documented and verified against the exact deployed environment and commit.
