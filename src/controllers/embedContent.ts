import pdfParse from "pdf-parse";
import axios from "axios";
import * as cheerio from 'cheerio';
import dotenv from "dotenv";
import { extractTextFromImage } from "./imageFile";
import { extractTextFromDocx } from "./googleDocx";
import { extractTextFromYouTube } from "./video";
import { extractTextFromTweet } from "./tweet";

dotenv.config();

// Axios downloads the file as raw buffer/binary

// Extract text from Pdfs
export const extractTextFromPdf = async ( pdfUrl : string ) => {
    const response  = await axios.get( pdfUrl, { responseType : "arraybuffer",
        headers: {
            // Pretend to be a browser
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
            "Accept": "application/pdf",
            "Accept-Language": "en-US,en;q=0.9",
        }}
    );
    const parsedPdf = await pdfParse(Buffer.from(response.data)); // Converts binary to buffer
    return parsedPdf.text;
}


// Scrape content from weblink Blob/ Article
// Axios returns the HTML webpage by default as string
export const extractTextFromLinks = async ( url : string ) => {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data); // Loads HTML

    // Remove unwanted elements
    $("script, style, noscript, iframe, header, footer, nav, aside").remove();

    const seen = new Set();
    // Extract text from multiple relevant tags and clean it
    const extractedText = $("p, h1, h2, h3, h4, h5, h6, li")
            .map((_, el) => $(el).text().replace(/\s+/g, " ").trim())
            .get()
            .filter(text => {
                if (text.length < 3) return false; // Remove short junk text
                if ((text.match(/[^a-zA-Z0-9\s.,'!?-]/g) ?? []).length > text.length * 0.3) return false;
                if (text.includes("fill:") || text.includes("{") || text.includes("}")) return false; // Remove CSS junk
                if (seen.has(text)) return false; // Remove duplicates
                seen.add(text);
                return true;
            })
            .join("\n\n");
    console.log(extractedText);

    return extractedText;
}


// Determine the Content Type and extract text of respective content type by calling exact function to handle its type
export const extractContentFromLink = async ( link : string ) => {
    try{
        if(link.includes("x.com")){
            return await extractTextFromTweet(link);
        }
        const response = await axios.get(link, {
            responseType : "arraybuffer",
            maxRedirects : 5,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", // Imitates a real browser
            },
        });
        console.log(response.headers);
        const mimeType = response.headers["content-type"] || "" as string;
        console.log(mimeType);
    
        if(!mimeType){
            throw new Error(`Invalid content type for link ${link}`);
        }
    
        if(mimeType.includes("pdf")){
            return await extractTextFromPdf(link);
        }
        else if(mimeType.includes("word") || mimeType.includes("docx")){
            return await extractTextFromDocx(link);
        }
        
        else if(mimeType.includes("image")){
            return await extractTextFromImage(link);
        }
        else if(mimeType.includes("text/html")){
            if(link.includes("youtube") || link.includes("youtu.be")){
                return await extractTextFromYouTube(link);
            }
            else if(link.includes("docs")){
                return await extractTextFromDocx(link);
            }
            else if(link.includes("pdf")){
                return await extractTextFromPdf(link);
            }
            else if(link.includes("x.com") || link.includes("twitter.com")){
                return await extractTextFromTweet(link);
            }
            else{
                return await extractTextFromLinks(link);
            }
        }
      
        else{
            return "Unsupported mime type";
        }    
    }
    catch(err){
        throw new Error(`Error extracting content from link ${err}`);
    }
}


