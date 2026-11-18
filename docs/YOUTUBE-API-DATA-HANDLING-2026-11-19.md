# AgentTube YouTube API Data handling — 2026-11-19

**Status: BLOCKED.** This is a source-level control record, not a deployment audit or Google approval.

## Prohibited access methods
Do not scrape YouTube Applications or use undocumented YouTube Application endpoints, including youtubei.js/Innertube or undocumented /youtubei routes. Do not use unofficial transcript extraction. Google policy requires documented YouTube API Services and prohibits scraping/undocumented APIs: https://developers.google.com/youtube/terms/developer-policies/ (III.D.6).

## Official captions API
- captions.list returns caption-track metadata only: https://developers.google.com/youtube/data/reference/rest/v3/captions/list
- captions.download requires the authorized user to have permission to edit the video: https://developers.google.com/youtube/data/reference/rest/v3/captions/download
- These endpoints are not a general public-video transcript source.

## Retention and deletion
- Other Authorized API Data: refresh or delete within 30 calendar days.
- Non-Authorized API Data: refresh or delete within 30 calendar days.
- Authorized Analytics API, Reporting API, and statistics may be retained longer only as necessary for specific consent from an active user; recheck authorization and video existence every 30 calendar days. Non-Authorized statistics cannot use this exception.
- User-requested deletion: as soon as possible and within 7 calendar days.
- Client-initiated revocation: revoke the token immediately and delete related Authorized Data as soon as possible and within 7 calendar days.
- Google Security Settings revocation: delete all related API Data as soon as possible and within 30 calendar days.

Official source: https://developers.google.com/youtube/terms/developer-policies/ (III.D.3, III.E.4, III.E.7).

## Deployed verification status
The policy file explicitly marks Convex storage inventory, retention-job execution, Analytics authorization rechecks, video-existence rechecks, user deletion, immediate token revocation, client-revocation deletion, Google Security Settings revocation deletion, and cross-channel aggregation verification as not_verified. Existing transcript records have not been inventoried, read, modified, or deleted. The draft branch disables transcript reads/writes and metadata access; the default branch still contains the prior unofficial transcript path until the draft is reviewed, merged, and deployed.

No API Data collection/storage may be enabled until the actual API Client boundary and child-directed assessment are approved and each deployed control is verified end-to-end against the exact deployed environment and commit. Cross-channel API Data aggregation remains disabled.
