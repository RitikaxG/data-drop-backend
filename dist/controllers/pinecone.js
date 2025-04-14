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
exports.upsertData = exports.index = exports.vectorDatabase = exports.pc = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const pinecone_1 = require("@pinecone-database/pinecone");
const getMetadata_1 = require("./getMetadata");
// Use API Key to initialize your client
exports.pc = new pinecone_1.Pinecone({
    apiKey: process.env.PINECONE_API_KEY
});
//  create a serverless index named "quickstart" that performs nearest-neighbor search using the cosine distance metric for 2-dimensional vectors
const vectorDatabase = () => __awaiter(void 0, void 0, void 0, function* () {
    const indexName = 'my-embeddings';
    yield exports.pc.createIndex({
        name: indexName,
        dimension: 384,
        metric: 'cosine',
        spec: {
            serverless: {
                cloud: 'aws',
                region: 'us-east-1'
            }
        }
    });
});
exports.vectorDatabase = vectorDatabase;
exports.index = exports.pc.index('my-embeddings'); // Get index you have created
// Upsert Data into Pinecone
const upsertData = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = yield (0, getMetadata_1.metaData)();
        const formattedData = data.map((item) => ({
            id: item.id,
            values: Array.isArray(item.values[0])
                ? item.values.flat() // Flatten if nested
                : item.values,
            metadata: item.metadata
        }));
        yield exports.index.upsert(formattedData);
        console.log("Embeddings successfully upserted");
    }
    catch (err) {
        console.error(`Error upserting data ${err}`);
    }
});
exports.upsertData = upsertData;
