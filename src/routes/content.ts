import { adminAuth } from "../middlewares/admin";
import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { ContentModel, TagModel } from "../db/db"; 
import { extractContentFromLink } from "../controllers/embedContent";
import { hfEmbedding } from "../services/huggingface";
import { formatEmbedding } from "./embeddings";
import { index } from "../services/pinecone";
import { assignTitle, summarizeChat } from "../services/mistralai";
import { generateTags } from "../services/cohereai";
import axios from "axios";

export const contentRouter = Router();

// Add new content
contentRouter.post('/content', adminAuth,  async(req : Request ,res : Response) : Promise<void>  => {
    const { type, link } = req.body;

    const text           = await extractContentFromLink(link);
    console.log(text);
    const summarizedText = await summarizeChat(text);
    const title          = await assignTitle(summarizedText);
    const tags           = await generateTags(summarizedText);

    const tagsArray = tags.trim().split(/\s+/).filter(tag => tag.length > 0);
    // Type inference using Zod
    const ContentSchema = z.object({
        type   : z.enum(['Youtube', 'Twitter', 'Docs','Pdf', 'Image', 'Webpage']),
        link   : z.string().url(),
    })

    const parsedDataWithSchema = ContentSchema.safeParse(req.body);

    if(!parsedDataWithSchema.success){
        const errors = parsedDataWithSchema.error.errors.map((err) => ({
            field   : err.path.join(' '),
            message : err.message
        }))

        res.status(401).json({
            message : "Error in content format",
            error   : errors
        })
        return;
    }
   
    try {


        const contentExists = await ContentModel.findOne({
            type,
            link,
            userId : req.userId,
        })

        if(contentExists){
            res.status(401).send("Content already exists");
            return;
        }

        await Promise.all(tagsArray.map(async (tagTitle : string) => {
            let tag : any = await TagModel.findOne({
                title : tagTitle
            })
        
            if(!tag){
                await TagModel.create({
                    title : tagTitle
                })
            }
        }))

        const newContent = await ContentModel.create({
            type,
            link,
            title,
            tags    : tagsArray,
            userId  : req.userId,
            summary : summarizedText
        })

        console.log(newContent);

        const embedding = await hfEmbedding(newContent.summary!);
        console.log(embedding);

        const record    = {
            id : newContent._id.toString(),
            values : formatEmbedding(embedding),
            metadata : {
                url     : newContent.link,
                title   : newContent.title,
                type    : newContent.type,
                tags    : newContent.tags,
            }
        }
        console.log(record);

        await index.upsert([record]);
        console.log("Data upserted");
        res.status(200).json({
            message : "Content successsfully added and upserted",
            content : newContent
        })
        return;
    }

    catch(err){
        if(err instanceof Error){
            console.error(err);
            res.status(500).send(`Error adding content ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
}) 

// Fetch all existing contents ( documents )
contentRouter.get('/content',  async(req : Request, res : Response ) : Promise<void> => {

    try {
        const contents = await ContentModel.find().lean();

        res.status(200).json({
            message  : "Contents fetched successfully",
            contents : contents
        })
        return;
    }
    catch(err){
        if(err instanceof Error){
            res.status(500).send(`Error fetching contents ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
})

// Deleting a content / document
contentRouter.delete('/content/:id', adminAuth, async(req : Request, res : Response ) : Promise<void> => {
    const contentId = req.params.id;

    if(!contentId || !mongoose.Types.ObjectId.isValid(contentId)){
        res.status(401).send("Invalid contentId");
        return;
    }

    try{
        const contentToBeDeleted = await ContentModel.findByIdAndDelete(contentId);

        if(!contentToBeDeleted){
            res.status(404).send(`Content with id ${contentId} not found`);
            return;
        }
        await index.deleteOne(contentId);
        res.status(200).send("Content deleted successfully from database and vector store");
        return;
    }
    catch(err){
        if( err instanceof Error ){
            res.status(500).send(`Error deleteing content ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
})

// Search via title
contentRouter.post('/content/search', adminAuth, async(req : Request, res : Response ) => {
    const { title } = req.body
    try{
        const contents  = await ContentModel.find();

        const matchedContents = await Promise.all(
            contents.filter(content => {
                if(content.title.toLowerCase().includes(title)){
                    return content
                }
            })
        )
        if(!matchedContents){
            res.status(400).send("No matches found");
            return;
        }
        else{
            res.status(200).json({
                message : `Contents with title ${title} successfully retreived`,
                matchedContents
            })
        }
    }
    catch(err){
        res.status(500).send(`Error searching for content ${err}`);
        return;
    }
})

// Search via type of content
contentRouter.post('/content/type', async (req : Request, res : Response) => {
    const { type } = req.body;
    try{
        const contents = await ContentModel.find({
            type : type
        })

        res.status(200).json({
            message  :  `Content of Type ${type} retreived successfully`,
            contents : contents
        })
        return;
    }
    catch(err){
        res.status(500).send(`Error retreiving contents ${err}`);
        return;
    }
})
    