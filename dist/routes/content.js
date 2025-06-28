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
exports.contentRouter = void 0;
const admin_1 = require("../middlewares/admin");
const express_1 = require("express");
const mongoose_1 = __importDefault(require("mongoose"));
const zod_1 = require("zod");
const db_1 = require("../db/db");
const embedContent_1 = require("../controllers/embedContent");
const huggingface_1 = require("../services/huggingface");
const embeddings_1 = require("./embeddings");
const pinecone_1 = require("../services/pinecone");
const mistralai_1 = require("../services/mistralai");
const cohereai_1 = require("../services/cohereai");
exports.contentRouter = (0, express_1.Router)();
// Add new content
exports.contentRouter.post('/content', admin_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, link } = req.body;
    const text = yield (0, embedContent_1.extractContentFromLink)(link);
    console.log(text);
    const summarizedText = yield (0, mistralai_1.summarizeChat)(text);
    const title = yield (0, mistralai_1.assignTitle)(summarizedText);
    const tags = yield (0, cohereai_1.generateTags)(summarizedText);
    const tagsArray = tags.trim().split(/\s+/).filter(tag => tag.length > 0);
    // Type inference using Zod
    const ContentSchema = zod_1.z.object({
        type: zod_1.z.enum(['Youtube', 'Twitter', 'Docs', 'Pdf', 'Image', 'Webpage']),
        link: zod_1.z.string().url(),
    });
    const parsedDataWithSchema = ContentSchema.safeParse(req.body);
    if (!parsedDataWithSchema.success) {
        const errors = parsedDataWithSchema.error.errors.map((err) => ({
            field: err.path.join(' '),
            message: err.message
        }));
        res.status(401).json({
            message: "Error in content format",
            error: errors
        });
        return;
    }
    try {
        const contentExists = yield db_1.ContentModel.findOne({
            type,
            link,
            userId: req.userId,
        });
        if (contentExists) {
            res.status(401).send("Content already exists");
            return;
        }
        yield Promise.all(tagsArray.map((tagTitle) => __awaiter(void 0, void 0, void 0, function* () {
            let tag = yield db_1.TagModel.findOne({
                title: tagTitle
            });
            if (!tag) {
                yield db_1.TagModel.create({
                    title: tagTitle
                });
            }
        })));
        const newContent = yield db_1.ContentModel.create({
            type,
            link,
            title,
            tags: tagsArray,
            userId: req.userId,
            summary: summarizedText
        });
        console.log(newContent);
        const embedding = yield (0, huggingface_1.hfEmbedding)(newContent.summary);
        console.log(embedding);
        const record = {
            id: newContent._id.toString(),
            values: (0, embeddings_1.formatEmbedding)(embedding),
            metadata: {
                url: newContent.link,
                title: newContent.title,
                type: newContent.type,
                tags: newContent.tags,
            }
        };
        yield pinecone_1.index.upsert([record]);
        res.status(200).json({
            message: "Content successsfully added and upserted",
            content: newContent
        });
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            console.error(err);
            res.status(500).send(`Error adding content ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
}));
// Fetch all existing contents ( documents )
exports.contentRouter.get('/content', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contents = yield db_1.ContentModel.find().lean();
        res.status(200).json({
            message: "Contents fetched successfully",
            contents: contents
        });
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(`Error fetching contents ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
}));
// Deleting a content / document
exports.contentRouter.delete('/content/:id', admin_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const contentId = req.params.id;
    if (!contentId || !mongoose_1.default.Types.ObjectId.isValid(contentId)) {
        res.status(401).send("Invalid contentId");
        return;
    }
    try {
        const contentToBeDeleted = yield db_1.ContentModel.findByIdAndDelete(contentId);
        if (!contentToBeDeleted) {
            res.status(404).send(`Content with id ${contentId} not found`);
            return;
        }
        yield pinecone_1.index.deleteOne(contentId);
        res.status(200).send("Content deleted successfully from database and vector store");
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(`Error deleteing content ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
}));
// Search via title
exports.contentRouter.post('/content/search', admin_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.body;
    try {
        const contents = yield db_1.ContentModel.find();
        const matchedContents = yield Promise.all(contents.filter(content => {
            if (content.title.toLowerCase().includes(title)) {
                return content;
            }
        }));
        if (!matchedContents) {
            res.status(400).send("No matches found");
            return;
        }
        else {
            res.status(200).json({
                message: `Contents with title ${title} successfully retreived`,
                matchedContents
            });
        }
    }
    catch (err) {
        res.status(500).send(`Error searching for content ${err}`);
        return;
    }
}));
// Search via type of content
exports.contentRouter.post('/content/type', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type } = req.body;
    try {
        const contents = yield db_1.ContentModel.find({
            type: type
        });
        res.status(200).json({
            message: `Content of Type ${type} retreived successfully`,
            contents: contents
        });
        return;
    }
    catch (err) {
        res.status(500).send(`Error retreiving contents ${err}`);
        return;
    }
}));
