import { Router, Request, Response } from "express";
import { extractMetaData } from "../controllers/scraper";
import { ContentModel } from "../db/db";

export const scraperRouter = Router();

scraperRouter.get('/scrape', async ( req : Request, res : Response ) => {
    try{
        const contents = await ContentModel.find();

        const unwrapedUrls = await Promise.all(
            contents.map(async content => {
                return await extractMetaData(content.link);
            })
        )

        res.status(200).json({
            message      : "Urls successfully unwrapped",
            unwrapedUrls
        })
    }
    catch(err){
        res.status(500).send(`Error unwrapping content from url ${err}`);
        return;
    }
})