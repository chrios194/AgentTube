import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getTranscriptByVideoId = query({
  args: {
    videoId: v.string(),
    userId: v.string(),
  },
  handler: async () => {
    throw new Error("YOUTUBE_TRANSCRIPT_STORAGE_DISABLED");
  },
});

export const storeTranscript = mutation({
  args: {
    videoId: v.string(),
    userId: v.string(),
    transcript: v.array(
      v.object({
        text: v.string(),
        timestamp: v.string(),
      })
    ),
  },
  handler: async () => {
    throw new Error("YOUTUBE_TRANSCRIPT_STORAGE_DISABLED");
  },
});

export const getTranscriptsByUserId = query({
  args: {
    userId: v.string(),
  },
  handler: async () => {
    throw new Error("YOUTUBE_TRANSCRIPT_STORAGE_DISABLED");
  },
});

// Retained for a user-initiated cleanup path. This change does not enumerate,
// read, or delete existing records and does not claim account-wide deletion.
export const deleteTranscript = mutation({
  args: { id: v.id("transcript"), userId: v.string() },
  handler: async (ctx, args) => {
    const transcript = await ctx.db.get(args.id);
    if (!transcript) {
      throw new Error("Transcript not found");
    }

    if (transcript.userId !== args.userId) throw new Error("Not authorized");

    await ctx.db.delete(args.id);
    return true;
  },
});
