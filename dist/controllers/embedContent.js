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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.extractContentFromLink = exports.extractTextFromLinks = exports.extractTextFromPdf = void 0;
const pdf_parse_1 = __importDefault(require("pdf-parse"));
const axios_1 = __importDefault(require("axios"));
const dotenv_1 = __importDefault(require("dotenv"));
const imageFile_1 = require("./imageFile");
const googleDocx_1 = require("./googleDocx");
const video_1 = require("./video");
const tweet_1 = require("./tweet");
dotenv_1.default.config();
// Axios downloads the file as raw buffer/binary
// Extract text from Pdfs
const extractTextFromPdf = (pdfUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(pdfUrl, { responseType: "arraybuffer",
        headers: {
            // Pretend to be a browser
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36",
            "Accept": "application/pdf",
            "Accept-Language": "en-US,en;q=0.9",
        } });
    const parsedPdf = yield (0, pdf_parse_1.default)(Buffer.from(response.data)); // Converts binary to buffer
    return parsedPdf.text;
});
exports.extractTextFromPdf = extractTextFromPdf;
// Scrape content from weblink Blob/ Article
// Axios returns the HTML webpage by default as string
const jsdom_1 = require("jsdom");
const extractTextFromLinks = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios_1.default.get(url);
    const dom = new jsdom_1.JSDOM(response.data);
    const document = dom.window.document;
    // Remove unwanted elements
    const unwantedSelectors = ['script', 'style', 'noscript', 'iframe', 'header', 'footer', 'nav', 'aside'];
    unwantedSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => el.remove());
    });
    const seen = new Set();
    // Extract text from multiple relevant tags and clean it
    const relevantElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li');
    const extractedTexts = [];
    relevantElements.forEach(el => {
        var _a, _b;
        const text = ((_a = el.textContent) === null || _a === void 0 ? void 0 : _a.replace(/\s+/g, " ").trim()) || "";
        // Apply the same filtering logic
        if (text.length < 3)
            return; // Remove short junk text
        if (((_b = text.match(/[^a-zA-Z0-9\s.,'!?-]/g)) !== null && _b !== void 0 ? _b : []).length > text.length * 0.3)
            return;
        if (text.includes("fill:") || text.includes("{") || text.includes("}"))
            return; // Remove CSS junk
        if (seen.has(text))
            return; // Remove duplicates
        seen.add(text);
        extractedTexts.push(text);
    });
    const extractedText = extractedTexts.join("\n\n");
    console.log(extractedText);
    return extractedText;
});
exports.extractTextFromLinks = extractTextFromLinks;
// Determine the Content Type and extract text of respective content type by calling exact function to handle its type
const extractContentFromLink = (link) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (link.includes("x.com")) {
            return yield (0, tweet_1.extractTextFromTweet)(link);
        }
        const response = yield axios_1.default.get(link, {
            responseType: "arraybuffer",
            maxRedirects: 5,
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)", // Imitates a real browser
            },
        });
        console.log(response.headers);
        const mimeType = response.headers["content-type"] || "";
        console.log(mimeType);
        if (!mimeType) {
            throw new Error(`Invalid content type for link ${link}`);
        }
        if (mimeType.includes("pdf")) {
            return yield (0, exports.extractTextFromPdf)(link);
        }
        else if (mimeType.includes("word") || mimeType.includes("docx")) {
            return yield (0, googleDocx_1.extractTextFromDocx)(link);
        }
        else if (mimeType.includes("image")) {
            return yield (0, imageFile_1.extractTextFromImage)(link);
        }
        else if (mimeType.includes("text/html")) {
            if (link.includes("youtube") || link.includes("youtu.be")) {
                console.log("Redirecting to extract text from video url");
                return yield (0, video_1.extractTextFromYouTube)(link);
            }
            else if (link.includes("docs")) {
                return yield (0, googleDocx_1.extractTextFromDocx)(link);
            }
            else if (link.includes("pdf")) {
                return yield (0, exports.extractTextFromPdf)(link);
            }
            else if (link.includes("x.com") || link.includes("twitter.com")) {
                return yield (0, tweet_1.extractTextFromTweet)(link);
            }
            else {
                return yield (0, exports.extractTextFromLinks)(link);
            }
        }
        else {
            return "Unsupported mime type";
        }
    }
    catch (err) {
        throw new Error(`Error extracting content from link ${err}`);
    }
});
exports.extractContentFromLink = extractContentFromLink;
