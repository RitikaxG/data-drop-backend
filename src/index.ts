import dotenv from "dotenv";
import express  from "express";
import mongoose from "mongoose";
import { rateLimit  } from 'express-rate-limit'
import { adminRouter } from "./routes/admin";
import { contentRouter } from "./routes/content";
import { brainRouter } from "./routes/brain";
import { embeddingRouter } from "./routes/embeddings";
import cors from "cors";
import { scraperRouter } from "./routes/scraper";

// In Express, the Request object (req) has a predefined type in TypeScript, which comes from the express package.
// By default, req does not include a userId property. If you try to assign a userId to req without explicitly extending its type,
// TypeScript will throw an error

declare global {
    namespace Express {
        export interface Request {
            userId : string
        }
    }
}

dotenv.config();
const MONGO_DB_URL = process.env.MONGO_DB_URL as string ;

const app = express();
app.use(express.json());

const limiter = rateLimit({
    windowMs  :15*60*1000, // 15 min window
    max       : 10 // Mx 5 request per IP address
})

app.use(cors());
// app.use(limiter);
app.use('/api/v1/user',adminRouter);
app.use('/api/v1',contentRouter);
app.use('/api/v1/brain',brainRouter);
app.use('/api/v1/embeddings',embeddingRouter);
app.use('/api/v1',scraperRouter);

const main = async () => {
    await mongoose.connect(MONGO_DB_URL);
    app.listen(3000, () => {
        console.log("Server is running on port 3000");
    })
}


main();