import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const policy = JSON.parse(readFileSync(path.join(root, "config/youtube-api-data-handling.json"), "utf8"));
const { getYouTubeApiAccessState } = require("../src/lib/youtube-api-access.js");

test("API Data collection and storage remain disabled until central approval", () => {
  assert.equal(policy.status, "blocked_unapproved");
  assert.equal(policy.api_data_collection_enabled, false);
  assert.equal(policy.api_data_storage_enabled, false);
  const state = getYouTubeApiAccessState();
  assert.equal(state.allowed, false);
  assert.ok(state.blockers.some(value => value.includes("storage inventory")));
});

test("unofficial scraping and undocumented endpoints, including youtubei.js/Innertube, are prohibited", () => {
  assert.equal(policy.unofficial_youtube_scraping_allowed, false);
  assert.equal(policy.undocumented_youtube_application_endpoints_allowed, false);
  assert.equal(policy.youtubei_js_innertube_allowed, false);
});

test("official captions API limits are explicit", () => {
  assert.equal(policy.captions_list_returns_metadata_only, true);
  assert.equal(policy.captions_download_requires_video_edit_permission, true);
  assert.equal(policy.captions_download_is_general_public_transcript_source, false);
});

test("30-day retention and analytics exception require active consent and two rechecks", () => {
  assert.equal(policy.other_authorized_api_data_refresh_or_delete_days, 30);
  assert.equal(policy.non_authorized_api_data_refresh_or_delete_days, 30);
  assert.equal(policy.authorized_analytics_reporting_statistics_retention_exception_requires_active_user_consent, true);
  assert.equal(policy.analytics_reporting_authorization_recheck_interval_days, 30);
  assert.equal(policy.analytics_reporting_video_existence_recheck_interval_days, 30);
});

test("user deletion, client revocation, and Google Security Settings revocation use distinct deadlines", () => {
  assert.equal(policy.user_requested_data_deletion_within_days, 7);
  assert.equal(policy.client_revocation_token_revoke_immediately, true);
  assert.equal(policy.client_revocation_data_deletion_within_days, 7);
  assert.equal(policy.google_security_settings_revocation_data_deletion_within_days, 30);
});

test("cross-channel and cross-content-owner API Data aggregation remain disabled", () => {
  assert.equal(policy.cross_channel_api_data_aggregation_allowed, false);
  assert.equal(policy.cross_content_owner_api_data_aggregation_allowed, false);
  assert.equal(policy.central_dashboard_api_data_access, "operational_metadata_only");
  const state = getYouTubeApiAccessState();
  assert.ok(state.blockers.some(value => value.includes("cross-content-owner")));
});

test("deployed storage, retention, user deletion, and revocation controls are not falsely marked verified", () => {
  for (const status of Object.values(policy.deployed_verification)) assert.equal(status, "not_verified");
  assert.equal(policy.api_client_approval_ref, null);
  assert.equal(policy.deployed_verification.deployed_environment_and_commit, "not_verified");
  assert.equal(policy.deployed_verification.complete_storage_inventory, "not_verified");
  assert.equal(policy.deployed_verification.analytics_active_user_consent, "not_verified");
  assert.equal(policy.deployed_verification.cross_account_aggregation_disabled, "not_verified");
  assert.equal(policy.deployed_verification.cross_content_owner_aggregation_disabled, "not_verified");
});
