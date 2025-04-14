import dotenv from "dotenv";
import axios from "axios";
dotenv.config();

import puppeteer from "puppeteer";

const extractTweetId = ( tweetUrl : string ) => {
    const match = tweetUrl.match(/status\/(\d+)/);
    return match ? match[1] : null;
}

export const extractTextFromTweet  = async ( tweetUrl : string ) => {
    const tweetId = extractTweetId(tweetUrl);
    console.log(tweetId);
    if(!tweetId){
        console.warn("Invalid tweet URL");
        return;
    }

    const url = `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=text`;
    try{
        const response = await axios.get(url,{
            headers : {
                Authorization : `Bearer ${process.env.TWITTER_BEARER_TOKEN}`
            }
        })
        console.log(response.data);
        return response.data.data.text;
    }
    catch(err){
        console.error(`Error fetching text from tweet ${err}`);
        return "";
    }
   
}


