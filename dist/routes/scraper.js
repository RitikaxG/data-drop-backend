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
exports.scraperRouter = void 0;
const express_1 = require("express");
const scraper_1 = require("../controllers/scraper");
const db_1 = require("../db/db");
exports.scraperRouter = (0, express_1.Router)();
exports.scraperRouter.get('/scrape', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const contents = yield db_1.ContentModel.find();
        const unwrapedUrls = yield Promise.all(contents.map((content) => __awaiter(void 0, void 0, void 0, function* () {
            return yield (0, scraper_1.extractMetaData)(content.link);
        })));
        res.status(200).json({
            message: "Urls successfully unwrapped",
            unwrapedUrls
        });
    }
    catch (err) {
        res.status(500).send(`Error unwrapping content from url ${err}`);
        return;
    }
}));
