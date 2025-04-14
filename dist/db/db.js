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
exports.ContentModel = exports.TagModel = exports.LinkModel = exports.AdminModel = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_DB_URL = process.env.MONGO_DB_URL;
const Schema = mongoose_1.default.Schema;
const ObjectId = mongoose_1.default.Types.ObjectId;
mongoose_1.default.connect(MONGO_DB_URL);
const AdminSchema = new Schema({
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    firstname: String,
    lastname: String
});
exports.AdminModel = mongoose_1.default.model("Admin", AdminSchema);
const ContentSchema = new Schema({
    type: { type: String, enum: ['Youtube', 'Twitter', 'Docs', 'Pdf', 'Image', 'Webpage'], required: true },
    link: { type: String, required: true },
    title: { type: String, required: true },
    tags: [{ type: String, ref: "Tag" }],
    summary: String,
    userId: { type: ObjectId, ref: "Admin", required: true,
        validate: function (value) {
            return __awaiter(this, void 0, void 0, function* () {
                const user = yield exports.AdminModel.findById(value);
                if (!user) {
                    throw new Error("Invalid user");
                }
            });
        } },
});
const TagsSchema = new Schema({
    title: { type: String, unique: true, required: true }
});
const LinksSchema = new Schema({
    hash: { type: String, required: true },
    userId: { type: ObjectId, ref: "Admin", required: true }
});
exports.LinkModel = mongoose_1.default.model('Link', LinksSchema);
exports.TagModel = mongoose_1.default.model('Tag', TagsSchema);
exports.ContentModel = mongoose_1.default.model("Course", ContentSchema);
