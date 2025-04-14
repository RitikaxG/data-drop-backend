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
exports.formatEmbedding = exports.embeddingRouter = void 0;
const getMetadata_1 = require("../controllers/getMetadata");
const express_1 = require("express");
const huggingface_1 = require("../services/huggingface");
const pinecone_1 = require("../services/pinecone");
const pinecone_2 = require("../services/pinecone");
const mistralai_1 = require("../services/mistralai");
const cohereai_1 = require("../services/cohereai");
const db_1 = require("../db/db");
const admin_1 = require("../middlewares/admin");
exports.embeddingRouter = (0, express_1.Router)();
const formatEmbedding = (embedding) => {
    if (typeof embedding === 'number')
        return embedding;
    if (Array.isArray(embedding) && Array.isArray(embedding[0])) {
        return embedding.flat();
    }
    return embedding;
};
exports.formatEmbedding = formatEmbedding;
exports.embeddingRouter.get('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const texts = yield (0, getMetadata_1.textsFromLinks)();
        // const metadata = await metaData();
        // const embeddings = await getAllEmbeddings()
        const titles = yield Promise.all(texts.map((text) => __awaiter(void 0, void 0, void 0, function* () {
            const title = yield (0, mistralai_1.assignTitle)(text);
            return title;
        })));
        const tags = yield Promise.all(texts.map((text) => __awaiter(void 0, void 0, void 0, function* () {
            const tags = yield (0, cohereai_1.generateTags)(text);
            return tags;
        })));
        res.status(200).json({
            message: "Successfully converts all file types to text",
            texts,
            titles,
            tags
            // embeddings : embeddings
        });
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(`Error converting file types to texts ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
    }
}));
exports.embeddingRouter.get('/upsertData', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield (0, pinecone_1.vectorDatabase)();
        res.status(200).send("Data indexed successfully");
    }
    catch (err) {
        res.status(500).send(`Error upserting data ${err}`);
    }
}));
exports.embeddingRouter.post('/getQuery', admin_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Extract Query
        const query = req.body.query;
        if (!query) {
            res.status(400).send("Query is required");
        }
        // 2. Convert Query to Embeddings
        const queryEmbedding = yield (0, huggingface_1.hfEmbedding)(query);
        const formattedEmbedding = (0, exports.formatEmbedding)(queryEmbedding);
        // 3. Search in Pinecone ( Retreive top 5 matches )
        const results = yield pinecone_2.index.query({
            vector: formattedEmbedding,
            topK: 5,
            includeMetadata: true
        });
        const retreivedDocs = results.matches.map((match) => {
            var _a, _b, _c, _d;
            return ({
                score: match.score,
                url: (_a = match.metadata) === null || _a === void 0 ? void 0 : _a.url,
                title: (_b = match.metadata) === null || _b === void 0 ? void 0 : _b.title,
                type: (_c = match.metadata) === null || _c === void 0 ? void 0 : _c.type,
                tags: (_d = match.metadata) === null || _d === void 0 ? void 0 : _d.tags
            });
        });
        const summarizedTexts = (yield Promise.all(retreivedDocs.map((doc) => __awaiter(void 0, void 0, void 0, function* () {
            const contents = yield db_1.ContentModel.findOne({
                link: doc.url
            });
            return contents === null || contents === void 0 ? void 0 : contents.summary;
        })))).filter((summary) => summary !== null && summary !== undefined);
        const gptResponse = yield (0, mistralai_1.mistralAIChat)(query, summarizedTexts);
        console.log(gptResponse);
        res.status(200).json({
            message: "Query retrieved successfully",
            matches: retreivedDocs,
            summarizedTexts: summarizedTexts,
            gptResponse: gptResponse
        });
    }
    catch (err) {
        res.status(500).send(`Error getting query from user ${err}`);
    }
}));
exports.embeddingRouter.get('/tags', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const texts = yield (0, getMetadata_1.textsFromLinks)();
        const tags = yield Promise.all(texts.map((text) => __awaiter(void 0, void 0, void 0, function* () {
            const tags = yield (0, cohereai_1.generateTags)(text);
            return tags;
        })));
        res.status(200).json({
            message: "Tags generated successfully",
            tags: tags
        });
        return;
    }
    catch (err) {
        res.status(500).send(`Error generating tags ${err}`);
    }
}));
