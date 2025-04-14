import { getSubtitles } from "youtube-captions-scraper";
import { HindiToEnglish } from "../services/mistralai";

// Extracts text from a YouTube video.

export const extractTextFromYouTube = async (youtubeUrl: string) : Promise<string> => {

    try {
        // Fetch captions
        const captions = await extractCaptionsFromYouTube(youtubeUrl);
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
};


// Extracts captions from YouTube 

const extractCaptionsFromYouTube = async (youtubeUrl: string): Promise<string> => {
    try {
        const videoId = extractYouTubeVideoId(youtubeUrl);
        if (!videoId) throw new Error("Invalid YouTube URL");

        let captions;
        try{
            captions = await getSubtitles({ videoID: videoId, lang: "en" });
        }
        catch(err){
            console.error("English captions not available trying Hindi captions..");
            captions = await getSubtitles({ videoID : videoId, lang : "hi"});
            console.log(captions);
        }

        if(captions){
            captions = captions.map((caption) => caption.text).join(" ");
            console.log(captions);
            // Add a prompt to convert Hindi captions to English 
            captions = await HindiToEnglish(captions);
            console.log(captions);
            return captions;
        }
        else{
            return "";
        }

    } catch (error) {
        console.warn("⚠️ Could not extract captions:", error);
        return "";
    }
};


// Extracts YouTube video ID from a URL.

const extractYouTubeVideoId = (url: string): string  => {
    const match = url.match(/(?:youtube\.com\/.*v=|youtu\.be\/)([^&]+)/);
    return match ? match[1] : "";
};


