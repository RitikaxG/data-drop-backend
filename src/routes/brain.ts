import dotenv from "dotenv";
import { Router, Request, Response } from "express";
import { ContentModel, LinkModel } from "../db/db";
import { adminAuth } from "../middlewares/admin";

dotenv.config();
export const brainRouter = Router();
const BASE_URL    = process.env.BASE_URL as string;

const generateHash = () => {

    let randomHash = "";
    const string =  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890";

    for(let i=0;i<16; i++){
        randomHash += string[Math.floor(Math.random() * string.length)];
    }
    return randomHash;
}


// Create sharable link for second brain content
brainRouter.post("/share", adminAuth, async ( req : Request, res : Response ) => {
    try{
        const { share } = req.body;
        if(share){

            const existingLink = await LinkModel.findOne({ userId : req.userId });
            if(!existingLink){
                const hash = generateHash();
                const newLink = await LinkModel.create({
                    hash   : hash,
                    userId : req.userId
                })

                res.status(200).json({
                    message : "Hash generated successfully",
                    hash    : hash
                })
                return;
            }
            else{
                res.status(200).json({
                    message : "Hash already created",
                    hash    : existingLink.hash
                })
            }
        }
        else{
            await LinkModel.deleteOne({
                userId : req.userId
            })
            res.status(200).json({
                message : "Link Disbaled",
            })
            return;
        }
    }
    catch(err){
        res.status(500).send(`Error generating hash ${err}`);
        return;
    }
})

// Fetch another users shared brain content
brainRouter.get('/:shareLink' , async( req : Request, res : Response) => {
    let shareLink  = req.params.shareLink;
    
    try{
        const sharedLink = await LinkModel.findOne({
            hash : shareLink
        })

        if(!sharedLink){
            res.status(411).send(`Invalid share brain url`);
            return;
        }

        const sharedContent = await ContentModel.find({
            userId : sharedLink.userId
        }).populate("userId", "firstname lastname");
        console.log(sharedContent);

        if(!sharedContent){
            res.status(400).send("ShareLink is invalid");
            return;
        }
        res.status(200).json({
            message : "Successfully fetched users shared brain content",
            content : sharedContent
        })
        return;
    }
    catch(err){
        if(err instanceof Error){
            res.status(500).send(`Error fetching users shared brain content ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
    
})