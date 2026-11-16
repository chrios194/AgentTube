export type YouTubeApiClientComplianceState = {
  allowed: boolean;
  blockers: string[];
  config: unknown;
};

export function getYouTubeApiClientComplianceState(options?: { apiKey?: string; config?: unknown }): YouTubeApiClientComplianceState;
export function assertYouTubeApiClientCompliance(apiKey?: string, config?: unknown): YouTubeApiClientComplianceState;
export function getYouTubeTranscriptAccessState(config?: unknown): { allowed: boolean; blockers: string[] };
export function assertYouTubeTranscriptAccess(config?: unknown): { allowed: boolean; blockers: string[] };
