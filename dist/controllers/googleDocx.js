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
exports.extractTextFromDocx = void 0;
const axios_1 = __importDefault(require("axios"));
const mammoth_1 = __importDefault(require("mammoth"));
// Extract text from Docx
const extractTextFromDocx = (docxUrl) => __awaiter(void 0, void 0, void 0, function* () {
    if (docxUrl.includes("docs.google.com/document")) {
        docxUrl = convertGoogleDocsToDownloadableLink(docxUrl);
    }
    const response = yield axios_1.default.get(docxUrl, { responseType: "arraybuffer" });
    const parsedDocx = yield mammoth_1.default.extractRawText({ buffer: Buffer.from(response.data) });
    return parsedDocx.value;
});
exports.extractTextFromDocx = extractTextFromDocx;
// Google Docs does not provide a direct .docx URL. Instead, you must convert the document to a downloadable .docx file first before processing it.
const convertGoogleDocsToDownloadableLink = (docxUrl) => {
    const match = docxUrl.match(/\/document\/d\/([^\/]+)/);
    if (!match) {
        console.warn("Incorrext Google Docx url");
        return "";
    }
    const docId = match[1];
    return `https://docs.google.com/document/d/${docId}/export?format=docx`;
};
