import express, { Request, Response, Router } from "express";
import {array, z} from "zod";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import mongoose from "mongoose";

import { AdminModel } from "../db/db";


dotenv.config();

export const adminRouter = Router();
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET as string;

// Admin signup endpoint
adminRouter.post('/signup', async (req : Request ,res : Response)  : Promise<void>   =>  {
    console.log("Signup request received");
    const { email, password, firstname, lastname } = req.body;

    const user = await AdminModel.findOne({
        email : email
    })

    if(user){
        res.status(401).send("User already exists");
        return;
    }

    // Type inference using zod
    const userSchema = z.object({
        email     : z.string().min(3).max(30).email({message :"Invalid email format"}),
        password  : z.string().min(8).max(32)
                        .refine((password) => /[A-Z]/.test(password) ,     { message : "Must have atleast one uppercase letter"} )
                        .refine((passowrd) => /[a-z]/.test(password),      { message : "Must have atleast one lowercase letter"} )
                        .refine((password) => /[0-9]/.test(password),      { message : "Must have atleast one digit"})
                        .refine((password) => /[!@#$%^&*]/.test(password), { message : "Must have atleast one special character "}),
        firstname : z.string().min(3).max(10),
        lastname  : z.string().min(3).max(10).optional()
    })

    
    const parseDataWithSchema = userSchema.safeParse(req.body);

    if(!parseDataWithSchema.success){
        const errors =  parseDataWithSchema.error.errors.map((err) => ({
            field   : err.path.join("."),
            message : err.message
        }))

        res.status(411).json({
            message : "Error in input format",
            error   : errors
        })
        return;
    }

    try{
        const hashedPassword = await bcrypt.hash(password,5);
        await AdminModel.create({
            email     : email,
            password  : hashedPassword,
            firstname : firstname,
            lastname  : lastname
        })

        res.status(200).send("User successfully signed up");
        return;

    }
    catch(err : any){
        if(err instanceof Error){
            if((err as any).code === 11000){
                res.status(403).send("User already exists");
                return;
            }
            else{
                res.status(500).send(`Error signing up ${err.message}`);
                return;
            }
        }
        
        res.status(500).send("An unknown error occurred");
        return;
    }

})

// Admin signin endpoint
adminRouter.post('/signin', async(req : Request, res : Response)  : Promise<void>  => {
    const { email, password } = req.body;
    
    try{
        const user = await AdminModel.findOne({
            email : email
        })
    
        if(!user){
            res.status(401).send("User not found");
            return;
        }
    
        const passwordMatch = await bcrypt.compare(password, user.password);
        if(passwordMatch){
            const token = jwt.sign({
                id : user._id
            },ADMIN_JWT_SECRET)
    
            res.status(200).json({
                message : "User successfully logged in",
                token   : token
            })
            return;
        }
        else {
            res.status(403).send("Incorrect password");
            return;
        }
    }

    catch(err){
        if(err instanceof Error){
            res.status(500).send(`Error logging in ${err.message}`);
            return;
        }
        
        res.status(500).send("An unknown error occurred");
        return;
    }
    
})

