import axios from "axios";
import protobuf from "protobufjs";
import { Buffer } from "buffer";
import { youtube_v3 } from "@googleapis/youtube";

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

// YouTube client with API key
const youtubeClient = new youtube_v3.Youtube({
  auth: YOUTUBE_API_KEY, 
});

// Extract video ID from YouTube URL
const extractYouTubeVideoId = (url: string): string => {
  const match = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
};

// Convert JSON to base64-encoded Protobuf
const getBase64Protobuf = (message: Record<string, any>) => {
  const filtered = Object.fromEntries(
    Object.entries(message).filter(([_, v]) => v != null)
  );

  const root = protobuf.Root.fromJSON({
    nested: {
      Message: {
        fields: {
          param1: { id: 1, type: "string" },
          param2: { id: 2, type: "string" },
        },
      },
    },
  });

  const MessageType = root.lookupType("Message");
  const buffer = MessageType.encode(filtered).finish();
  return Buffer.from(buffer).toString("base64");
};

// Get default language + track type (manual/ASR)
const getDefaultSubtitleLanguage = async (videoId: string) => {
  const videos = await youtubeClient.videos.list({
    part: ["snippet"],
    id: [videoId],
  });

  const snippet = videos.data.items?.[0]?.snippet;
  const preferred = snippet?.defaultLanguage || snippet?.defaultAudioLanguage || "en";

  try {
    const captions = await youtubeClient.captions.list({
      part: ["snippet"],
      videoId,
    });

    if (captions.data.items?.length) {
      const best = captions.data.items.find(
        (c) => c.snippet?.language === preferred
      ) || captions.data.items[0];

      return {
        language: best.snippet?.language || preferred,
        trackKind: best.snippet?.trackKind || "standard",
      };
    }
  } catch {}

  return {
    language: preferred,
    trackKind: "asr",
  };
};

// 📦 MAIN FUNCTION — returns captions from YouTube URL
export const extractTextFromYouTube = async (
  youtubeUrl: string
): Promise<string> => {
  try {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) throw new Error("Invalid YouTube URL");

    const { language, trackKind } = await getDefaultSubtitleLanguage(videoId);

    const innerMessage = {
      param1: trackKind === "asr" ? trackKind : undefined,
      param2: language,
    };

    const payload = {
      param1: videoId,
      param2: getBase64Protobuf(innerMessage),
    };

    const params = getBase64Protobuf(payload);

    const response = await axios.post(
      "https://www.youtube.com/youtubei/v1/get_transcript",
      {
        context: {
          client: {
            clientName: "WEB",
            clientVersion: "2.20240826.01.00",
          },
        },
        params,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const segments =
      response.data.actions?.[0]?.updateEngagementPanelAction?.content
        ?.transcriptRenderer?.content?.transcriptSearchPanelRenderer?.body
        ?.transcriptSegmentListRenderer?.initialSegments;

    if (!segments?.length) throw new Error("No captions found");

    const fullText = segments
      .map((seg: any) => {
        const snippet =
          seg.transcriptSegmentRenderer?.snippet ||
          seg.transcriptSectionHeaderRenderer?.snippet;
        return snippet?.simpleText || snippet?.runs?.map((r: any) => r.text).join("") || "";
      })
      .join(" ")
      .trim();

    return fullText;
  } catch (err) {
    console.error("❌ Failed to extract captions:", (err as Error).message);
    return "";
  }
};



