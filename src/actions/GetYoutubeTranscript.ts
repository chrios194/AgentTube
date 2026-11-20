"use server";

export interface TranscriptEntry {
  text: string;
  timestamp: string;
}

/**
 * Fail-closed guard. The previous implementation used youtubei.js/Innertube,
 * an unofficial YouTube Application interface, to retrieve transcripts.
 * Do not restore transcript retrieval until a compliant, authorized source
 * and the required API Client review are implemented.
 */
export const GetYoutubeTranscript = async (_videoId: string) => {
  throw new Error(
    "YOUTUBE_TRANSCRIPT_UNAVAILABLE: Transcript retrieval is disabled until an official, authorized captions source is implemented."
  );
};
