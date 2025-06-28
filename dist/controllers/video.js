"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractTextFromYouTube = void 0;
const youtube_captions_scraper_1 = require("youtube-captions-scraper");
// Extracts text from a YouTube video.
const extractTextFromYouTube = (youtubeUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId)
            throw new Error("Invalid YouTube URL");
        const captions = yield extractCaptionsFromYouTube(videoId);
        if (captions.length > 0) {
            const fullText = captions.map((item) => item.text).join(" ");
            console.log(`Returning extracted captions: ${fullText}`);
            return fullText;
        }
    }
    catch (error) {
        console.error("Error processing YouTube URL:", error);
        return ""; // Return empty text instead of crashing
    }
    return "";
});
exports.extractTextFromYouTube = extractTextFromYouTube;
// Extract captions from YouTube using youtube-transcript-api
const extractCaptionsFromYouTube = (url) => {
    const videoId = extractYouTubeVideoId(url);
    const captions = (0, youtube_captions_scraper_1.getSubtitles)({ videoID: videoId, lang: "a.en" });
    return captions;
};
// Extracts YouTube video ID from a URL.
const extractYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtu\.be\/|v=)([A-Za-z0-9_-]{11})/);
    return match ? match[1] : "";
};
