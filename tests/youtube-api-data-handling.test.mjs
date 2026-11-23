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

test("YouTube audiovisual content copying is blocked without prior written approval and provenance", () => {
  assert.equal(policy.audiovisual_content.download_without_prior_written_approval_allowed, false);
  assert.equal(policy.audiovisual_content.import_without_prior_written_approval_allowed, false);
  assert.equal(policy.audiovisual_content.backup_without_prior_written_approval_allowed, false);
  assert.equal(policy.audiovisual_content.cache_without_prior_written_approval_allowed, false);
  assert.equal(policy.audiovisual_content.storage_without_prior_written_approval_allowed, false);
  assert.equal(policy.audiovisual_content.prior_written_youtube_approval_required, true);
  assert.equal(policy.audiovisual_content.source_provenance_required, true);
  assert.equal(policy.audiovisual_content.public_youtube_url_is_permission_to_download, false);
  assert.deepEqual(policy.audiovisual_content.allowed_sources, [
    "original_source_files",
    "user_supplied_files",
    "rights_holder_assets_obtained_through_authorized_sources"
  ]);
});

test("derived metrics remain disabled unless every exact Analytics exception gate is approved", () => {
  assert.equal(policy.derived_metrics.enabled_by_default, false);
  assert.equal(policy.derived_metrics.exception_requires_additional_policies_amendment_acceptance, true);
  assert.equal(policy.derived_metrics.exception_requires_analytics_reporting_use_case, true);
  assert.equal(policy.derived_metrics.exception_requires_compliance_audit_approval, true);
  assert.equal(policy.derived_metrics.exception_requires_standard_quota_extension_approval, true);
  assert.equal(policy.derived_metrics.exception_requires_specific_metrics_and_storage_approval, true);
  assert.equal(policy.derived_metrics.exception_max_storage_calendar_months, 36);
  assert.equal(policy.derived_metrics.derived_metrics_must_be_distinguished_from_raw_api_data, true);
  assert.equal(policy.derived_metrics.cross_channel_api_data_aggregation_allowed, false);
  assert.equal(policy.derived_metrics.cross_content_owner_api_data_aggregation_allowed, false);
  assert.equal(policy.derived_metrics.central_leaderboard_api_data_allowed, false);
  assert.equal(policy.derived_metrics.central_leaderboard_source, "independently_generated_non_youtube_operational_metrics_only");
});

test("YouTube writes require exact single-use consent and automated engagement writes are prohibited", () => {
  assert.equal(policy.write_actions.prior_specific_express_user_consent_required, true);
  assert.equal(policy.write_actions.consent_required_per_api_action, true);
  assert.equal(policy.write_actions.consent_must_bind_api_client_channel_resource_payload_hash_visibility, true);
  assert.equal(policy.write_actions.consent_single_use, true);
  assert.equal(policy.write_actions.consent_atomic_consumption, true);
  assert.equal(policy.write_actions.consent_consumed_immediately_before_adapter_dispatch, true);
  assert.equal(policy.write_actions.consent_replay_allowed, false);
  assert.equal(policy.write_actions.user_controls_final_submitted_values, true);
  assert.equal(policy.write_actions.submitted_values_locked_after_approval, true);
  assert.equal(policy.write_actions.renewed_consent_required_after_any_submitted_value_change, true);
  assert.equal(policy.write_actions.child_directed_api_client_write_actions_allowed, false);
  assert.equal(policy.write_actions.automated_views_likes_comments_subscriptions_allowed, false);
  assert.equal(policy.write_actions.automated_engagement_manipulation_allowed, false);
  assert.equal(policy.write_actions.publishing_allowed, false);
});

test("new media, derived-metric, and write-action deployment controls remain unverified", () => {
  assert.equal(policy.deployed_verification.audiovisual_copy_controls, "not_verified");
  assert.equal(policy.deployed_verification.derived_metrics_exception_controls, "not_verified");
  assert.equal(policy.deployed_verification.write_action_consent_controls, "not_verified");
  assert.equal(policy.deployed_verification.automated_engagement_write_controls, "not_verified");
});
