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
exports.getAllEmbeddings = exports.textsFromLinks = exports.getLinks = void 0;
const db_1 = require("../db/db");
const embedContent_1 = require("./embedContent");
const huggingface_1 = require("./huggingface");
const getLinks = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Even though we are fetching only link field mongoose will return an array of objects containing other details as array
        const contents = yield db_1.ContentModel.find().lean(); // Only fetch link field
        console.log(contents);
        const allLinks = contents.map(content => content.link);
        console.log(allLinks);
        return allLinks;
    }
    catch (err) {
        throw new Error(`Error fetching links ${err}`);
    }
});
exports.getLinks = getLinks;
const textsFromLinks = () => __awaiter(void 0, void 0, void 0, function* () {
    const allLinks = yield (0, exports.getLinks)();
    try {
        const texts = yield Promise.all(allLinks.map(link => (0, embedContent_1.extractContentFromLink)(link)));
        return texts;
    }
    catch (err) {
        throw new Error(`Error getting texts from links ${err}`);
    }
});
exports.textsFromLinks = textsFromLinks;
const getAllEmbeddings = () => __awaiter(void 0, void 0, void 0, function* () {
    const texts = yield (0, exports.textsFromLinks)();
    if (!texts) {
        throw new Error("Texts not available");
    }
    const embeddings = yield Promise.all(texts.map(text => (0, huggingface_1.hfEmbedding)(text)));
    return embeddings;
});
exports.getAllEmbeddings = getAllEmbeddings;
