"use strict";

const config = require("../config/youtube-api-client-compliance.json");
const failures = [];
if (config.schemaVersion !== 1) failures.push("schemaVersion must be 1");
if (config.apiClient?.id !== "agenttube-video-analysis") failures.push("API Client id mismatch");
if (config.apiClient?.boundaryStatus === "approved") failures.push("unreviewed API Client boundary cannot be approved");
if (config.boundaryReview?.status === "approved") failures.push("boundary review cannot be approved in the default staging package");
if (config.childDirectedAssessment?.status !== "not_assessed") failures.push("child-directed status must remain unassessed");
if (config.complianceAudit?.status !== "not_started") failures.push("compliance audit must remain not started");
if (config.apiProject?.projectCountForClient !== 0) failures.push("no API Project may be assigned in the default staging package");
if (config.apiProject?.projectId !== null || config.apiProject?.apiKeyFingerprint !== null) failures.push("no API Project ID or API key fingerprint may be present");
if (config.apiProject?.crossClientUniquenessReviewStatus !== "not_started" || config.apiProject?.crossClientUniquenessEvidenceRef !== null) failures.push("cross-client project uniqueness review must remain pending");
if (config.controls?.projectProvisioningAllowed !== false ||
    config.controls?.credentialProvisioningAllowed !== false ||
    config.controls?.apiAccessAllowed !== false ||
    config.controls?.writeActionsAllowed !== false ||
    config.controls?.quotaShardingAllowed !== false ||
    config.controls?.perChannelProjectCreationAllowed !== false) {
  failures.push("all provisioning, API access, write, and quota-sharding controls must remain closed");
}
if (config.transcriptAccess?.allowed !== false || config.transcriptAccess?.reviewStatus !== "not_started") {
  failures.push("InnerTube transcript access must remain disabled pending separate Terms review");
}
if (failures.length) {
  console.error(JSON.stringify({ status: "FAIL", suite: "youtube-api-client-compliance", failures }, null, 2));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify({ status: "PASS", suite: "youtube-api-client-compliance", api_client: config.apiClient.id, verified_api_projects: 0, api_access_enabled: false, transcript_access_enabled: false }));
}
