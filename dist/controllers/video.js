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
const mistralai_1 = require("../services/mistralai");
// Extracts text from a YouTube video.
const extractTextFromYouTube = (youtubeUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Fetch captions
        const captions = yield extractCaptionsFromYouTube(youtubeUrl);
        if (captions) {
            console.log(`Returning extracted captions ${captions}`);
            return captions;
        }
    }
    catch (error) {
        console.error(" Error processing YouTube URL:", error);
        return ""; // Return empty text instead of crashing
    }
    return "";
});
exports.extractTextFromYouTube = extractTextFromYouTube;
// Extracts captions from YouTube 
const extractCaptionsFromYouTube = (youtubeUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId)
            throw new Error("Invalid YouTube URL");
        let captions;
        try {
            captions = yield (0, youtube_captions_scraper_1.getSubtitles)({ videoID: videoId, lang: "en" });
        }
        catch (err) {
            console.error("English captions not available trying Hindi captions..");
            captions = yield (0, youtube_captions_scraper_1.getSubtitles)({ videoID: videoId, lang: "hi" });
            console.log(captions);
        }
        if (captions) {
            captions = captions.map((caption) => caption.text).join(" ");
            console.log(captions);
            // Add a prompt to convert Hindi captions to English 
            captions = yield (0, mistralai_1.HindiToEnglish)(captions);
            console.log(captions);
            return captions;
        }
        else {
            return "";
        }
    }
    catch (error) {
        console.warn("⚠️ Could not extract captions:", error);
        return "";
    }
});
// Extracts YouTube video ID from a URL.
const extractYouTubeVideoId = (url) => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : "";
};
