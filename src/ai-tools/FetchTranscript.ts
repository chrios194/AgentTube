import { z } from "zod";
import { tool } from "ai";

const fetchTranscript = tool({
  description:
    "Disabled: transcript retrieval is unavailable until an official, authorized YouTube captions source is implemented.",
  parameters: z.object({
    videoId: z.string().describe("The video ID whose transcript was requested"),
  }),
  execute: async ({ videoId }) => ({
    available: false,
    code: "YOUTUBE_TRANSCRIPT_UNAVAILABLE",
    videoId,
    message:
      "No transcript was fetched or stored. The previous transcript source used a non-official YouTube interface and is disabled pending a compliant, authorized source.",
  }),
});

export default fetchTranscript;
