import dotenv from "dotenv";
import { Mistral } from '@mistralai/mistralai';
import { encode } from "gpt-tokenizer";

dotenv.config();

const client = new Mistral({
    apiKey : process.env.MISTRALAI_API_KEY
})

// Answer Users query based on the content provided
export const mistralAIChat = async ( query: String, retreivedDocs : string[] ) : Promise<string> => {
    try{
        const prompt = `
        You are an intelligent assistant. Using the provided context, answer the query in the most helpful, informative, and human-friendly way.

        Instructions:
        - Structure the answer clearly with proper headings and spacing.
        - Use bullet points or numbered lists where applicable.
        - Avoid redundancy and keep responses concise but complete.
        - Maintain a professional yet friendly tone.

        Context:
        ${retreivedDocs.join('\n\n')}

        Query:
        ${query}

        `;

        const response = await client.chat.complete({
            model : "mistral-large-latest",
            messages : [
                {
                    role    : "user",
                    content : prompt
                }
            ]
        })
        const responseContent = response?.choices?.[0].message.content;

        if(typeof responseContent === "string"){
            return responseContent;
        }
        else{
            console.error("Failed to load chat completion from OpenAI");
            return "";
        }
    }
    catch(err){
        console.error(`Error fetching chat completion from OpenAI ${err}`);
        return "";
    }
}

export const truncateText  = ( text : string ) : string => {
    const MAX_CHARS = 3000;

    if(text.length > MAX_CHARS ){
        text = text.slice(0,MAX_CHARS)
    }
    
    return text;
}

// Summarize Texts
export const summarizeChat = async ( chat : string ) : Promise<string> => {
    try{
        chat = truncateText(chat);

        const prompt = `Summarize the following Content in 300 words in a way that is most informative.
        Content : ${chat}`;

        const response = await client.chat.complete({
            model : 'mistral-large-latest',
            messages : [
                {
                role    : 'user',
                content : prompt
                }
        ]})

        const responseContent = response?.choices?.[0].message.content;

        if( typeof responseContent === 'string' ){
            return responseContent
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

// Assign Title to the Summary
export const assignTitle   = async ( summary : string ) : Promise<string> => {
    try{
        const prompt = `Based on the summary provided generate a concise and engaging title (maximum 8 words) that accurately represents the core topic of the given summary. Avoid redundancy and keep it precise. 
        Just return the title not explanation/justification for it.
        Summary : ${summary}`;

        const response = await client.chat.complete({
            model : 'mistral-large-latest',
            messages : [
                {
                role    : 'user',
                content : prompt
                }
        ]})

        const responseContent = response?.choices?.[0].message.content;

        if( typeof responseContent === 'string' ){
            return responseContent
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

export const HindiToEnglish = async ( chat : string )   : Promise<string> => {
    try{
        chat = truncateText(chat);
        
        const prompt = `If the following Content is in Hindi convert to English such that its meaning is intact else return Content as it is.
        Content : ${chat}`;

        const response = await client.chat.complete({
            model : 'mistral-large-latest',
            messages : [
                {
                role    : 'user',
                content : prompt
                }
        ]})

        const responseContent = response?.choices?.[0].message.content;

        if( typeof responseContent === 'string' ){
            return responseContent
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



