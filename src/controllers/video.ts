import TranscriptAPI from "youtube-transcript-api";

// Type for each transcript segment
type TranscriptResponse = {
  text: string;
  duration: number;
  offset: number;
};

// Extracts text from a YouTube video.
export const extractTextFromYouTube = async (youtubeUrl: string): Promise<string> => {
  try {
    const videoId = extractYouTubeVideoId(youtubeUrl);
    if (!videoId) throw new Error("Invalid YouTube URL");

    const captions = await extractCaptionsFromYouTube(videoId);
    if (captions.length > 0) {
      const fullText = captions.map((item) => item.text).join(" ");
      console.log(`Returning extracted captions: ${fullText}`);
      return fullText;
    }
  } catch (error) {
    console.error("Error processing YouTube URL:", error);
    return ""; // Return empty text instead of crashing
  }

  return "";
};

// Extract captions from YouTube using youtube-transcript-api
const extractCaptionsFromYouTube = async (
  videoId: string
): Promise<TranscriptResponse[]> => {
  const result = (await TranscriptAPI.getTranscript(videoId)) as {
    start: string;
    text: string;
    duration: string;
  }[];

  const transcript: TranscriptResponse[] = result.map((r) => ({
    text: r.text,
    duration: Number(r.duration),
    offset: Number(r.start),
  }));

  return transcript;
};

// Extracts YouTube video ID from a URL.
const extractYouTubeVideoId = (url: string): string => {
  const match = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : "";
};


