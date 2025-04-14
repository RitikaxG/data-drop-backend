import dotenv from "dotenv";
import { CohereClientV2 } from 'cohere-ai';
import { truncateText } from "./mistralai";
dotenv.config();
const cohere = new CohereClientV2({
    token: process.env.COHERE_API_KEY,
  });


export const generateTags = async ( content : string )   : Promise<string> => {
    try{
        content = truncateText(content);
        
        const prompt = `Generate up to 3 one-word tags for the following content. Return only the tags, space-separated, without any explanation or extra text:
        ${content}`;

        const response = await cohere.chat({
            model : 'command-a-03-2025',
            messages : [
                {
                role    : 'user',
                content : prompt
                }
        ]})

        const textBlock = response?.message?.content?.find((block: any) => block.type === 'text');

        if( textBlock && typeof textBlock.text === 'string' ){
            return textBlock.text.trim();
        }
        
        else{
            console.error("Failed to load chat completion from OpenAI");
            return "";
        }
    }
    catch(err){
        console.error(`Error summarising text ${err}`);
        return "";
    }
}