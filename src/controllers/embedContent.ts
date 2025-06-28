import pdfParse from "pdf-parse";
import axios from "axios";
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
import { JSDOM } from 'jsdom';

export const extractTextFromLinks = async (url: string) => {
    const response = await axios.get(url);
    const dom = new JSDOM(response.data);
    const document = dom.window.document;

    // Remove unwanted elements
    const unwantedSelectors = ['script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav', 'aside'];
    unwantedSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });

    const seen = new Set<string>();
    
    // Extract text from multiple relevant tags and clean it
    const relevantElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    const extractedTexts: string[] = [];
    
    relevantElements.forEach(el => {
        const text = el.textContent?.replace(/\s+/g, " ").trim() || "";
        
        // Apply the same filtering logic
        if (text.length < 3) return; // Remove short junk text
        if ((text.match(/[^a-zA-Z0-9\s.,'!?-]/g) ?? []).length > text.length * 0.3) return;
        if (text.includes("fill:") || text.includes("{") || text.includes("}")) return; // Remove CSS junk
        if (seen.has(text)) return; // Remove duplicates
        
        seen.add(text);
        extractedTexts.push(text);
    });
    
    const extractedText = extractedTexts.join("\n\n");
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
                console.log("Redirecting to extract text from video url");
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



