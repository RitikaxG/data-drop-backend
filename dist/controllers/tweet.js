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
exports.extractTextFromTweet = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const axios_1 = __importDefault(require("axios"));
dotenv_1.default.config();
const extractTweetId = (tweetUrl) => {
    const match = tweetUrl.match(/status\/(\d+)/);
    return match ? match[1] : null;
};
const extractTextFromTweet = (tweetUrl) => __awaiter(void 0, void 0, void 0, function* () {
    const tweetId = extractTweetId(tweetUrl);
    console.log(tweetId);
    if (!tweetId) {
        console.warn("Invalid tweet URL");
        return;
    }
    const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=text`;
    try {
        const response = yield axios_1.default.get(url, {
            headers: {
                Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            }
        });
        console.log(response.data);
        return response.data.data.text;
    }
    catch (err) {
        console.error(`Error fetching text from tweet ${err}`);
        return "";
    }
});
exports.extractTextFromTweet = extractTextFromTweet;
