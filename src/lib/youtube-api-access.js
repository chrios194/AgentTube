"use strict";

// This application is a separate YouTube API Client candidate from the publisher product.
// Keep access hard-disabled until the central boundary review, final child-directed
// assessment, required audit/approval, exclusive project mapping, least-privilege review,
// and deployed API Data retention/deletion verification are complete. Do not replace
// this with an environment-variable bypass.
const YOUTUBE_API_ACCESS_ENABLED = false;
const DATA_HANDLING_POLICY = require("../../config/youtube-api-data-handling.json");

const POLICY_BLOCKERS = Object.freeze([
  "API Client boundary and child-directed assessment are not approved",
  "API Data collection and storage are disabled",
  "deployed Convex storage inventory and retention jobs are not verified",
  "30-day retention and Analytics authorization/video-existence rechecks are not deployment-verified",
  "user deletion, immediate token revocation, 7-day client-revocation deletion, and 30-day Google Security Settings deletion are not verified",
  "cross-account, cross-channel, and cross-content-owner API Data aggregation are disabled and not yet deployment-verified",
  "the exact deployed environment and commit have not been verified"
]);

const BLOCKED_STATE = Object.freeze({
  allowed: YOUTUBE_API_ACCESS_ENABLED &&
    DATA_HANDLING_POLICY.status === "approved" &&
    DATA_HANDLING_POLICY.api_data_collection_enabled === true &&
    DATA_HANDLING_POLICY.api_data_storage_enabled === true,
  code: "YOUTUBE_API_COMPLIANCE_BLOCKED",
  message:
    "Official YouTube metadata access is paused until this application's API Client review, child-directed assessment, required compliance audit or documented not-required decision, exclusive API Project mapping, least-privilege review, and deployed API Data retention/deletion verification are complete. Do not create or add a YOUTUBE_API_KEY.",
  blockers: POLICY_BLOCKERS
});

function getYouTubeApiAccessState() {
  return BLOCKED_STATE;
}

module.exports = { getYouTubeApiAccessState, DATA_HANDLING_POLICY };
