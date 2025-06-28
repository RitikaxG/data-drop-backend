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
exports.hfEmbedding = void 0;
const inference_1 = require("@huggingface/inference");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const hf = new inference_1.HfInference(process.env.HF_TOKEN);
const hfEmbedding = (input) => __awaiter(void 0, void 0, void 0, function* () {
    const output = yield hf.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: input
    });
    return output;
});
exports.hfEmbedding = hfEmbedding;
