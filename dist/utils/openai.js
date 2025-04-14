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
exports.summarizeChat = exports.mistralAIChat = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const mistralai_1 = require("@mistralai/mistralai");
dotenv_1.default.config();
const client = new mistralai_1.Mistral({
    apiKey: process.env.MISTRALAI_API_KEY
});
const mistralAIChat = (query, retreivedDocs) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const prompt = `Given the following context answer the query in the most helpful and informative way
        Context : ${retreivedDocs.join('\n')}
        Query   : ${query}
        `;
        const response = yield client.chat.complete({
            model: "mistral-large-latest",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ]
        });
        const responseContent = (_a = response === null || response === void 0 ? void 0 : response.choices) === null || _a === void 0 ? void 0 : _a[0].message.content;
        if (typeof responseContent === "string") {
            return responseContent;
        }
        else {
            console.error("Failed to load chat completion from OpenAI");
            return "";
        }
    }
    catch (err) {
        console.error(`Error fetching chat completion from OpenAI ${err}`);
        return "";
    }
});
exports.mistralAIChat = mistralAIChat;
const summarizeChat = (chat) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const prompt = `Summarize the following Content in 300 words in a way that is most informative.
        Content : ${chat}`;
        const response = yield client.chat.complete({
            model: 'mistral-large-latest',
            messages: [
                {
                    role: 'user',
                    content: prompt
                }
            ]
        });
        const responseContent = (_a = response === null || response === void 0 ? void 0 : response.choices) === null || _a === void 0 ? void 0 : _a[0].message.content;
        if (typeof responseContent === 'string') {
            return responseContent;
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
exports.summarizeChat = summarizeChat;
