import axios from "axios";
import ogs from "open-graph-scraper";

export const extractMetaData = async ( url : string ) => {
    const response    = await ogs({url})
    return response;
}