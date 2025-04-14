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
exports.generateTags = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const cohere_ai_1 = require("cohere-ai");
const mistralai_1 = require("./mistralai");
dotenv_1.default.config();
const cohere = new cohere_ai_1.CohereClientV2({
    token: process.env.COHERE_API_KEY,
});
const generateTags = (content) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        content = (0, mistralai_1.truncateText)(content);
        const prompt = `Generate up to 3 one-word tags for the following content. Return only the tags, space-separated, without any explanation or extra text:
        ${content}`;
        const response = yield cohere.chat({
            model: 'command-a-03-2025',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });
        const textBlock = (_b = (_a = response === null || response === void 0 ? void 0 : response.message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.find((block) => block.type === 'text');
        if (textBlock && typeof textBlock.text === 'string') {
            return textBlock.text.trim();
        }
        else {
            console.error("Failed to load chat completion from OpenAI");
            return "";
        }
    }
    catch (err) {
        console.error(`Error summarising text ${err}`);
        return "";
    }
});
exports.generateTags = generateTags;
