import dotenv from "dotenv";
dotenv.config();

import mongoose, { ObjectId } from "mongoose";

const MONGO_DB_URL : string = process.env.MONGO_DB_URL as string ;
const Schema       = mongoose.Schema;
const ObjectId     = mongoose.Types.ObjectId;

mongoose.connect(MONGO_DB_URL);

const AdminSchema = new Schema({
    email     : { type : String, unique : true, required : true },
    password  : { type : String, required : true},
    firstname : String,
    lastname  : String
})

export const AdminModel   = mongoose.model("Admin",AdminSchema);


const ContentSchema = new Schema({
    type    : { type : String, enum : ['Youtube', 'Twitter', 'Docs', 'Pdf','Image', 'Webpage'], required : true},
    link    : { type : String, required : true },
    title   : { type : String, required : true },
    tags    : [{ type : String , ref : "Tag" }],
    summary : String,
    userId  : { type  : ObjectId , ref : "Admin", required : true , 
        validate : async function(value: ObjectId ) {
            const user = await AdminModel.findById(value);
            if(!user){
                throw new Error("Invalid user");
            }
        }},
        
})

const TagsSchema = new Schema({
    title : { type : String, unique : true, required : true }
})

const LinksSchema = new Schema({
    hash    : { type : String, required : true },
    userId  : { type : ObjectId, ref : "Admin", required : true }
})

export const LinkModel    = mongoose.model('Link', LinksSchema);
export const TagModel     = mongoose.model('Tag',TagsSchema);
export const ContentModel = mongoose.model("Course", ContentSchema);