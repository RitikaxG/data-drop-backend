import { ContentModel } from "../db/db";
import { extractContentFromLink } from "./embedContent";
import { hfEmbedding } from "../services/huggingface";
import { summarizeChat, truncateText } from "../services/mistralai";

export const getLinks = async () => {
    try{
        // Even though we are fetching only link field mongoose will return an array of objects containing other details as array
        const contents  = await ContentModel.find().lean() ; // Only fetch link field
        console.log(contents);
        const allLinks  = contents.map(content => content.link);
        console.log(allLinks);
        return allLinks;
    }
    catch(err){
        throw new Error(`Error fetching links ${err}`);
    }
}

export const textsFromLinks = async () => {
    const allLinks = await getLinks();
    
    try{
        const texts = await Promise.all(allLinks.map(link => extractContentFromLink(link)));  
        return texts;

    }
    catch(err){
        throw new Error(`Error getting texts from links ${err}`);
    }
}

export const getAllEmbeddings = async () => {
    const texts      = await textsFromLinks();
    if(!texts){
        throw new Error("Texts not available");
    }
    const embeddings = await Promise.all(texts.map(text => hfEmbedding(text)));

    return embeddings;
}

export const metaData = async () => {
    const contents = await ContentModel.find();
    return Promise.all(
        contents.map(async (content,index) => {
            let text = await extractContentFromLink(content.link);
            text     = summarizeChat(text);
            
            const embedding = await hfEmbedding(text)
            
             return {
                id     : `content_${index}`,
                values : embedding,
                metadata : {
                    url   : content.link,
                    title : content.title,
                    type  : content.type,
                    text,
                }
            }
        })
    )
}