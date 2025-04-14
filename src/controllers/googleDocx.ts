import axios from "axios";
import mammoth from "mammoth";

// Extract text from Docx
export const extractTextFromDocx = async ( docxUrl : string ) => {
    if(docxUrl.includes("docs.google.com/document")){
        docxUrl = convertGoogleDocsToDownloadableLink( docxUrl );
    }
    const response   = await axios.get(docxUrl, { responseType : "arraybuffer"});
    const parsedDocx = await mammoth.extractRawText({buffer : Buffer.from(response.data) });
    return parsedDocx.value ;
}

// Google Docs does not provide a direct .docx URL. Instead, you must convert the document to a downloadable .docx file first before processing it.
const convertGoogleDocsToDownloadableLink = ( docxUrl : string ) => {
    const match = docxUrl.match(/\/document\/d\/([^\/]+)/);
    if(!match){
        console.warn("Incorrext Google Docx url");
        return "";
    }

    const docId = match[1];
    return `https://docs.google.com/document/d/${docId}/export?format=docx`;
}