import dotenv from "dotenv";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
dotenv.config();


const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

export const adminAuth = ( req : Request, res : Response, next : NextFunction ) : void => {

    const token        = req.get("Authorization");
    const parsedToken  = token?.split(" ")[1];
    
    if(parsedToken){
        jwt.verify(parsedToken, ADMIN_JWT_SECRET, (err, decodedData) => {
            if(err){
                res.status(401).send("Unauthorized user");
                return;
            }
            else{
                req.userId = (decodedData as JwtPayload).id;
                next();
            }
        })
    }
    else{
        res.status(403).send("Token not found");
        return;
    }
}