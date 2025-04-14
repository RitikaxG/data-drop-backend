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
exports.extractTextFromImage = void 0;
const axios_1 = __importDefault(require("axios"));
const tesseract_js_1 = require("tesseract.js");
// Extract Text from Image URL using Tesseract.js
const extractTextFromImage = (imageUrl) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield axios_1.default.get(imageUrl, { responseType: "arraybuffer" });
        let imageBuffer = Buffer.from(response.data);
        // Using Tesseract to convert image to text
        const worker = yield (0, tesseract_js_1.createWorker)("eng");
        const { data } = yield worker.recognize(imageBuffer);
        yield worker.terminate();
        return data.text.trim();
    }
    catch (err) {
        throw new Error(`Error converting image buffer to text ${err}`);
    }
});
exports.extractTextFromImage = extractTextFromImage;
