"use strict";

const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const defaultConfig = require("../config/youtube-api-client-compliance.json");
const {
  getYouTubeApiClientComplianceState,
  assertYouTubeApiClientCompliance,
  getYouTubeTranscriptAccessState,
  assertYouTubeTranscriptAccess
} = require("../src/lib/youtube-api-client-compliance");

function fingerprint(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function approvedConfig() {
  const config = structuredClone(defaultConfig);
  config.apiClient.boundaryStatus = "approved";
  config.boundaryReview.status = "approved";
  config.boundaryReview.evidenceRefs = ["review:api-client-boundary"];
  config.childDirectedAssessment.status = "no";
  config.childDirectedAssessment.evidenceRefs = ["review:child-directed-assessment"];
  config.complianceAudit.status = "approved";
  config.complianceAudit.evidenceRef = "review:compliance-audit";
  config.apiProject.projectCountForClient = 1;
  config.apiProject.projectId = "test-agenttube-project";
  config.apiProject.ownerApiClientId = config.apiClient.id;
  config.apiProject.credentialsExclusiveToClient = true;
  config.apiProject.apiKeyProjectId = config.apiProject.projectId;
  config.apiProject.apiKeyFingerprint = fingerprint("test-key");
  config.apiProject.crossClientUniquenessReviewStatus = "approved";
  config.apiProject.crossClientUniquenessEvidenceRef = "review:cross-client-project-uniqueness";
  config.controls.apiAccessAllowed = true;
  return config;
}

test("default API Client config fails closed and contains no project or credential", () => {
  const state = getYouTubeApiClientComplianceState({ config: defaultConfig, apiKey: "" });
  assert.equal(state.allowed, false);
  assert.equal(defaultConfig.apiProject.projectCountForClient, 0);
  assert.equal(defaultConfig.apiProject.projectId, null);
  assert.equal(defaultConfig.apiProject.apiKeyFingerprint, null);
  assert.equal(defaultConfig.controls.apiAccessAllowed, false);
  assert.ok(state.blockers.some(item => item.includes("child-directed status")));
});

test("one exclusive project and a matching key fingerprint are required", () => {
  const config = approvedConfig();
  assert.equal(getYouTubeApiClientComplianceState({ config, apiKey: "test-key" }).allowed, true);
  assert.throws(
    () => assertYouTubeApiClientCompliance("wrong-key", config),
    error => error.code === "YOUTUBE_API_CLIENT_COMPLIANCE_BLOCKED"
  );
});

test("multiple projects and shared credentials are rejected", () => {
  const config = approvedConfig();
  config.apiProject.projectCountForClient = 2;
  config.apiProject.credentialsExclusiveToClient = false;
  const state = getYouTubeApiClientComplianceState({ config, apiKey: "test-key" });
  assert.equal(state.allowed, false);
  assert.ok(state.blockers.some(item => item.includes("exactly one API Project")));
  assert.ok(state.blockers.some(item => item.includes("exclusive")));
});

test("cross-client project uniqueness review is mandatory", () => {
  const config = approvedConfig();
  config.apiProject.crossClientUniquenessReviewStatus = "not_started";
  config.apiProject.crossClientUniquenessEvidenceRef = null;
  const state = getYouTubeApiClientComplianceState({ config, apiKey: "test-key" });
  assert.equal(state.allowed, false);
  assert.ok(state.blockers.some(item => item.includes("cross-client API Project uniqueness review")));
});

test("API Project must belong to this API Client and key must map to that project", () => {
  const config = approvedConfig();
  config.apiProject.ownerApiClientId = "another-api-client";
  config.apiProject.apiKeyProjectId = "another-project";
  const state = getYouTubeApiClientComplianceState({ config, apiKey: "test-key" });
  assert.equal(state.allowed, false);
  assert.ok(state.blockers.some(item => item.includes("owner does not match")));
  assert.ok(state.blockers.some(item => item.includes("project mapping")));
});

test("unassessed child-directed status blocks API access", () => {
  const config = approvedConfig();
  config.childDirectedAssessment.status = "not_assessed";
  const state = getYouTubeApiClientComplianceState({ config, apiKey: "test-key" });
  assert.equal(state.allowed, false);
  assert.ok(state.blockers.some(item => item.includes("child-directed status")));
});

test("child-directed app requires notice, COPPA/GDPR review, and personalized ads disabled", () => {
  const config = approvedConfig();
  config.childDirectedAssessment.status = "yes";
  config.childDirectedAssessment.googleNotificationStatus = "submitted";
  config.childDirectedAssessment.coppaGdprReviewStatus = "approved";
  config.childDirectedAssessment.personalizedAdsEnabled = false;
  assert.equal(getYouTubeApiClientComplianceState({ config, apiKey: "test-key" }).allowed, true);
  config.childDirectedAssessment.personalizedAdsEnabled = true;
  assert.equal(getYouTubeApiClientComplianceState({ config, apiKey: "test-key" }).allowed, false);
});

test("runtime project and credential provisioning stay disabled", () => {
  const config = approvedConfig();
  config.controls.projectProvisioningAllowed = true;
  const state = getYouTubeApiClientComplianceState({ config, apiKey: "test-key" });
  assert.equal(state.allowed, false);
  assert.ok(state.blockers.some(item => item.includes("must not provision API Projects")));
});

test("InnerTube transcript retrieval is separately blocked until Terms review is approved", () => {
  assert.equal(getYouTubeTranscriptAccessState(defaultConfig).allowed, false);
  assert.throws(
    () => assertYouTubeTranscriptAccess(defaultConfig),
    error => error.code === "YOUTUBE_TRANSCRIPT_ACCESS_BLOCKED"
  );
  const config = structuredClone(defaultConfig);
  config.transcriptAccess.allowed = true;
  config.transcriptAccess.reviewStatus = "approved";
  config.transcriptAccess.evidenceRef = "review:youtube-terms";
  assert.equal(getYouTubeTranscriptAccessState(config).allowed, true);
});
