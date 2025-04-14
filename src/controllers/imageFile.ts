import axios from "axios";
import { createWorker } from "tesseract.js";

// Extract Text from Image URL using Tesseract.js
export const extractTextFromImage = async ( imageUrl : string ) => {
    try{
        const response  = await axios.get(imageUrl, { responseType : "arraybuffer" });
        let imageBuffer = Buffer.from(response.data);
    
        
        // Using Tesseract to convert image to text
        const worker   = await createWorker("eng");
        const { data } = await worker.recognize(imageBuffer);
        await worker.terminate();
    
        return data.text.trim();
    }
    catch(err){
        throw new Error(`Error converting image buffer to text ${err}`);
    }
}


