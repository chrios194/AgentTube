"use server";

import type { VideoDetails } from "@/types/types";
import { getYouTubeApiAccessState } from "@/lib/youtube-api-access";

type VideoDetailsResult =
  | { video: VideoDetails; error?: never }
  | { error: { code: string; title: string; description: string }; video?: never };

const GetVideoDetails = async (videoId: string): Promise<VideoDetailsResult> => {
  const access = getYouTubeApiAccessState();
  if (!access.allowed) {
    return {
      error: {
        code: access.code,
        title: "YouTube metadata access paused",
        description: access.message,
      },
    };
  }

  try {
    // Load the API client only after the fail-closed compliance gate allows access.
    const { google } = await import("googleapis");
    const youtube = google.youtube({
      version: "v3",
      auth: process.env.YOUTUBE_API_KEY,
    });

    const response = await youtube.videos.list({
      part: ["statistics", "snippet"],
      id: [videoId],
    });

    const videoDetails = response.data.items?.[0];
    if (!videoDetails) throw new Error("Video not found.");

    const channelResponse = await youtube.channels.list({
      part: ["snippet", "statistics"],
      id: [videoDetails.snippet?.channelId || ""],
      key: process.env.YOUTUBE_API_KEY,
    });

    const channelDetails = channelResponse.data.items?.[0];
    const video: VideoDetails = {
      title: videoDetails.snippet?.title || "Unknown Title",
      thumbnail:
        videoDetails.snippet?.thumbnails?.maxres?.url ||
        videoDetails.snippet?.thumbnails?.high?.url ||
        videoDetails.snippet?.thumbnails?.default?.url ||
        "",
      publishedAt: videoDetails.snippet?.publishedAt || new Date().toISOString(),
      views: videoDetails.statistics?.viewCount || "0",
      likes: videoDetails.statistics?.likeCount || "Not Available",
      comments: videoDetails.statistics?.commentCount || "Not Available",
      channel: {
        title: videoDetails.snippet?.channelTitle || "Unknown Channel",
        thumbnail: channelDetails?.snippet?.thumbnails?.default?.url || "",
        subscribers: channelDetails?.statistics?.subscriberCount || "0",
      },
    };

    return { video };
  } catch {
    return {
      error: {
        code: "YOUTUBE_METADATA_FETCH_FAILED",
        title: "Video Error",
        description: "Unable to fetch video details.",
      },
    };
  }
};

export default GetVideoDetails;
