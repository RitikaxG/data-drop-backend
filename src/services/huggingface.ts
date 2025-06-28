import { HfInference } from "@huggingface/inference";
import dotenv from "dotenv";

dotenv.config();

const hf = new HfInference(process.env.HF_TOKEN);

export const hfEmbedding = async ( input : string ) => {
    const output = await hf.featureExtraction({
        model  : "sentence-transformers/all-MiniLM-L6-v2",
        inputs : input
    })
    return output;
}

