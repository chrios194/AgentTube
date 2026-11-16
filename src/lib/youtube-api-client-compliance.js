"use strict";

const crypto = require("node:crypto");
const DEFAULT_CONFIG = require("../../config/youtube-api-client-compliance.json");

function nonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function getYouTubeApiClientComplianceState(options = {}) {
  const config = options.config || DEFAULT_CONFIG;
  const apiKey = options.apiKey === undefined ? process.env.YOUTUBE_API_KEY : options.apiKey;
  const client = config.apiClient || {};
  const boundary = config.boundaryReview || {};
  const child = config.childDirectedAssessment || {};
  const audit = config.complianceAudit || {};
  const project = config.apiProject || {};
  const controls = config.controls || {};
  const blockers = [];

  if (config.schemaVersion !== 1) blockers.push("unsupported compliance config schema");
  if (client.id !== "agenttube-video-analysis") blockers.push("API Client identity does not match this application");
  if (client.boundaryStatus !== "approved" || boundary.status !== "approved" || !Array.isArray(boundary.evidenceRefs) || boundary.evidenceRefs.length === 0) {
    blockers.push("actual API Client boundary review is not approved with evidence");
  }

  if (child.status !== "yes" && child.status !== "no") {
    blockers.push("child-directed status has not been assessed");
  } else if (!Array.isArray(child.evidenceRefs) || child.evidenceRefs.length === 0) {
    blockers.push("child-directed assessment requires supporting evidence");
  }
  if (child.status === "yes" && (
    child.googleNotificationStatus !== "submitted" ||
    child.coppaGdprReviewStatus !== "approved" ||
    child.personalizedAdsEnabled !== false
  )) {
    blockers.push("child-directed API Client requires documented Google notice, COPPA/GDPR review, and no personalized ads");
  }

  if (!["approved", "not_required"].includes(audit.status) || !nonEmpty(audit.evidenceRef)) {
    blockers.push("required compliance audit/approval is not documented");
  }

  if (project.projectCountForClient !== 1) blockers.push("exactly one API Project must be assigned to this API Client");
  if (!nonEmpty(project.projectId)) blockers.push("API Project ID is missing");
  if (project.ownerApiClientId !== client.id) blockers.push("API Project owner does not match this API Client");
  if (project.credentialsExclusiveToClient !== true) blockers.push("API key must be exclusive to this API Client");
  if (project.crossClientUniquenessReviewStatus !== "approved" || !nonEmpty(project.crossClientUniquenessEvidenceRef)) {
    blockers.push("central cross-client API Project uniqueness review is not approved with evidence");
  }
  if (project.apiKeyProjectId !== project.projectId) blockers.push("API key project mapping does not match the assigned API Project");
  if (!/^[a-f0-9]{64}$/.test(project.apiKeyFingerprint || "")) blockers.push("approved API key SHA-256 fingerprint is missing");

  if (controls.apiAccessAllowed !== true) blockers.push("YouTube Data API access is disabled");
  if (controls.projectProvisioningAllowed !== false) blockers.push("this application must not provision API Projects at runtime");
  if (controls.credentialProvisioningAllowed !== false) blockers.push("this application must not provision API credentials at runtime");
  if (controls.writeActionsAllowed !== false) blockers.push("this analysis application is read-only");
  if (controls.quotaShardingAllowed !== false) blockers.push("quota sharding is prohibited");
  if (controls.perChannelProjectCreationAllowed !== false) blockers.push("per-channel API Project creation is prohibited");

  if (!nonEmpty(apiKey)) {
    blockers.push("YOUTUBE_API_KEY is not configured");
  } else {
    const fingerprint = crypto.createHash("sha256").update(apiKey).digest("hex");
    if (fingerprint !== project.apiKeyFingerprint) blockers.push("runtime API key does not match the approved project-bound fingerprint");
  }

  return { allowed: blockers.length === 0, blockers, config };
}

function assertYouTubeApiClientCompliance(apiKey, config) {
  const state = getYouTubeApiClientComplianceState({ apiKey, config });
  if (!state.allowed) {
    const error = new Error("YouTube API access is blocked by the AgentTube API Client compliance gate");
    error.code = "YOUTUBE_API_CLIENT_COMPLIANCE_BLOCKED";
    error.status = 409;
    error.blockers = state.blockers;
    throw error;
  }
  return state;
}

function getYouTubeTranscriptAccessState(config = DEFAULT_CONFIG) {
  const transcript = config.transcriptAccess || {};
  const blockers = [];
  if (transcript.allowed !== true) blockers.push("youtubei.js/InnerTube transcript retrieval is disabled");
  if (transcript.reviewStatus !== "approved" || !nonEmpty(transcript.evidenceRef)) {
    blockers.push("separate YouTube Terms-of-Service review for transcript retrieval is not approved with evidence");
  }
  return { allowed: blockers.length === 0, blockers };
}

function assertYouTubeTranscriptAccess(config) {
  const state = getYouTubeTranscriptAccessState(config || DEFAULT_CONFIG);
  if (!state.allowed) {
    const error = new Error("YouTube transcript retrieval is blocked pending separate Terms-of-Service review");
    error.code = "YOUTUBE_TRANSCRIPT_ACCESS_BLOCKED";
    error.status = 409;
    error.blockers = state.blockers;
    throw error;
  }
  return state;
}

module.exports = {
  getYouTubeApiClientComplianceState,
  assertYouTubeApiClientCompliance,
  getYouTubeTranscriptAccessState,
  assertYouTubeTranscriptAccess
};
