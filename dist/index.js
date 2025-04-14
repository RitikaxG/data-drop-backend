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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const express_rate_limit_1 = require("express-rate-limit");
const admin_1 = require("./routes/admin");
const content_1 = require("./routes/content");
const brain_1 = require("./routes/brain");
const embeddings_1 = require("./routes/embeddings");
const cors_1 = __importDefault(require("cors"));
const scraper_1 = require("./routes/scraper");
dotenv_1.default.config();
const MONGO_DB_URL = process.env.MONGO_DB_URL;
const app = (0, express_1.default)();
app.use(express_1.default.json());
const limiter = (0, express_rate_limit_1.rateLimit)({
    windowMs: 15 * 60 * 1000, // 15 min window
    max: 10 // Mx 5 request per IP address
});
app.use((0, cors_1.default)());
// app.use(limiter);
app.use('/api/v1/user', admin_1.adminRouter);
app.use('/api/v1', content_1.contentRouter);
app.use('/api/v1/brain', brain_1.brainRouter);
app.use('/api/v1/embeddings', embeddings_1.embeddingRouter);
app.use('/api/v1', scraper_1.scraperRouter);
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    yield mongoose_1.default.connect(MONGO_DB_URL);
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    });
});
main();
