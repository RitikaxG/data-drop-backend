import dotenv from "dotenv";
dotenv.config();

import { Pinecone } from "@pinecone-database/pinecone";
import { metaData } from "../controllers/getMetadata";

// Use API Key to initialize your client
export const pc = new Pinecone({
    apiKey : process.env.PINECONE_API_KEY as string
})

//  create a serverless index named "quickstart" that performs nearest-neighbor search using the cosine distance metric for 2-dimensional vectors
export const vectorDatabase = async () => {
    const indexName = 'my-embeddings';
    await pc.createIndex({
        name      : indexName,
        dimension : 384,
        metric    : 'cosine',
        spec : {
            serverless : {
                cloud  : 'aws',
                region : 'us-east-1'
            }
        }
    })
}

export const index = pc.index('my-embeddings'); // Get index you have created

// Upsert Data into Pinecone
export const upsertData = async () => {
    try{
        const data  = await metaData();

        const formattedData = data.map((item) => ({
            id       : item.id,
            values   : Array.isArray(item.values[0])
                        ? ( item.values as number[][]).flat() // Flatten if nested
                        : ( item.values as number [] ),
            metadata : item.metadata
        }))

        await index.upsert(formattedData);
        console.log("Embeddings successfully upserted");
    }
    catch(err){
        console.error(`Error upserting data ${err}`);
    }
}