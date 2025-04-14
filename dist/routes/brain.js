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
exports.brainRouter = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = require("express");
const db_1 = require("../db/db");
const admin_1 = require("../middlewares/admin");
dotenv_1.default.config();
exports.brainRouter = (0, express_1.Router)();
const BASE_URL = process.env.BASE_URL;
const generateHash = () => {
    let randomHash = "";
    const string = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";
    for (let i = 0; i < 16; i++) {
        randomHash += string[Math.floor(Math.random() * string.length)];
    }
    return randomHash;
};
// Create sharable link for second brain content
exports.brainRouter.post("/share", admin_1.adminAuth, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { share } = req.body;
        if (share) {
            const existingLink = yield db_1.LinkModel.findOne({ userId: req.userId });
            if (!existingLink) {
                const hash = generateHash();
                const newLink = yield db_1.LinkModel.create({
                    hash: hash,
                    userId: req.userId
                });
                res.status(200).json({
                    message: "Hash generated successfully",
                    hash: hash
                });
                return;
            }
            else {
                res.status(200).json({
                    message: "Hash already created",
                    hash: existingLink.hash
                });
            }
        }
        else {
            yield db_1.LinkModel.deleteOne({
                userId: req.userId
            });
            res.status(200).json({
                message: "Link Disbaled",
            });
            return;
        }
    }
    catch (err) {
        res.status(500).send(`Error generating hash ${err}`);
        return;
    }
}));
// Fetch another users shared brain content
exports.brainRouter.get('/:shareLink', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let shareLink = req.params.shareLink;
    try {
        const sharedLink = yield db_1.LinkModel.findOne({
            hash: shareLink
        });
        if (!sharedLink) {
            res.status(411).send(`Invalid share brain url`);
            return;
        }
        const sharedContent = yield db_1.ContentModel.find({
            userId: sharedLink.userId
        }).populate("userId", "firstname lastname");
        if (!sharedContent) {
            res.status(400).send("ShareLink is invalid");
            return;
        }
        res.status(200).json({
            message: "Successfully fetched users shared brain content",
            content: sharedContent
        });
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(`Error fetching users shared brain content ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
}));
