"use strict";

// This application is a separate YouTube API Client from the publisher product.
// Keep access hard-disabled until the central boundary review, final child-directed
// assessment, required audit/approval, exclusive project mapping, and least-privilege
// scope review are documented. Do not replace this with an environment-variable bypass.
const YOUTUBE_API_ACCESS_ENABLED = false;

const BLOCKED_STATE = Object.freeze({
  allowed: YOUTUBE_API_ACCESS_ENABLED,
  code: "YOUTUBE_API_COMPLIANCE_BLOCKED",
  message:
    "Official YouTube metadata access is paused until this application's API Client review, child-directed assessment, required compliance audit or documented not-required decision, exclusive API Project mapping, and least-privilege review are complete. Do not create or add a YOUTUBE_API_KEY."
});

function getYouTubeApiAccessState() {
  return BLOCKED_STATE;
}

module.exports = { getYouTubeApiAccessState };
