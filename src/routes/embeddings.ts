import {  getAllEmbeddings, getLinks, metaData, textsFromLinks } from "../controllers/getMetadata";
import { Router, Request, Response } from "express";
import { hfEmbedding } from "../services/huggingface";
import { pc, upsertData, vectorDatabase } from "../services/pinecone";
import { FeatureExtractionOutput } from "@huggingface/inference";
import { index } from "../services/pinecone";
import { assignTitle, mistralAIChat, summarizeChat } from "../services/mistralai";
import { generateTags } from "../services/cohereai";
import { extractContentFromLink } from "../controllers/embedContent";
import { ContentModel } from "../db/db";
import { deleteIndex } from "@pinecone-database/pinecone/dist/control";
import { adminAuth } from "../middlewares/admin";


export const embeddingRouter = Router();

export const formatEmbedding = ( embedding : FeatureExtractionOutput ) : number[] => {
    if(typeof embedding === 'number' )
        return embedding;

    if(Array.isArray(embedding) && Array.isArray(embedding[0])){
        return (embedding as number[][]).flat()
    }

    return embedding as number []
}

embeddingRouter.get('/generate'  , async ( req : Request, res : Response ) => {
    try{
        const texts = await textsFromLinks();
        // const metadata = await metaData();
        // const embeddings = await getAllEmbeddings()

        const titles = await Promise.all(
            texts.map(async (text : string) => {
                const title = await assignTitle(text);
                return title;
            })
        )

        const tags = await Promise.all(
            texts.map(async (text : string) => {
                const tags = await generateTags(text);
                return tags;
            })
        )
        res.status(200).json({
            message    : "Successfully converts all file types to text",
            texts,
            titles,
            tags
            // embeddings : embeddings
        })
        return;
    }
    catch(err){
        if(err instanceof Error){
            res.status(500).send(`Error converting file types to texts ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
    }
})

embeddingRouter.get('/upsertData', async ( req : Request, res : Response ) => {
    try{
        
        await vectorDatabase()
        res.status(200).send("Data indexed successfully");
    }
    catch(err){
        res.status(500).send(`Error upserting data ${err}`)
    }
   
})

embeddingRouter.post('/getQuery' ,adminAuth, async ( req : Request, res : Response ) => {
    try{
        // 1. Extract Query
        const query = req.body.query;
        if(!query){
            res.status(400).send("Query is required");
        }

        // 2. Convert Query to Embeddings
        const queryEmbedding     = await hfEmbedding(query);
        const formattedEmbedding = formatEmbedding(queryEmbedding);

        // 3. Search in Pinecone ( Retreive top 5 matches )
        
        const results = await index.query({
            vector : formattedEmbedding,
            topK   : 5,
            includeMetadata : true
        })

        const retreivedDocs = results.matches.map((match) => ({
            score : match.score,
            url   : match.metadata?.url,
            title : match.metadata?.title,
            type  : match.metadata?.type,
            tags  : match.metadata?.tags

        }))


        const summarizedTexts = (await Promise.all(
            retreivedDocs.map(async (doc) => {
                const contents = await ContentModel.findOne({
                    link : doc.url
                })

                return contents?.summary
            })
        )).filter((summary) : summary is string => summary !== null && summary !== undefined)

        const gptResponse = await mistralAIChat(query, summarizedTexts);
        console.log(gptResponse);

        res.status(200).json({
            message : "Query retrieved successfully",
            matches : retreivedDocs,
            summarizedTexts : summarizedTexts,
            gptResponse     : gptResponse
        })
    }
    catch(err){
        res.status(500).send(`Error getting query from user ${err}`);
    }
})

embeddingRouter.get('/tags', async (req : Request, res : Response) => {
    try{
        const texts = await textsFromLinks();
        const tags  = await Promise.all(
            texts.map(async (text : string) => {
                const tags = await generateTags(text);
                return tags;
            })
        )
        res.status(200).json({
            message : "Tags generated successfully",
            tags    : tags
        })
        return;
    }
    catch(err){
        res.status(500).send(`Error generating tags ${err}`);
    }
})
