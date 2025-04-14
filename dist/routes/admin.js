"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const db_1 = require("../db/db");
dotenv_1.default.config();
exports.adminRouter = (0, express_1.Router)();
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
// Admin signup endpoint
exports.adminRouter.post('/signup', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Signup request received");
    const { email, password, firstname, lastname } = req.body;
    const user = yield db_1.AdminModel.findOne({
        email: email
    });
    if (user) {
        res.status(401).send("User already exists");
        return;
    }
    // Type inference using zod
    const userSchema = zod_1.z.object({
        email: zod_1.z.string().min(3).max(30).email({ message: "Invalid email format" }),
        password: zod_1.z.string().min(8).max(32)
            .refine((password) => /[A-Z]/.test(password), { message: "Must have atleast one uppercase letter" })
            .refine((passowrd) => /[a-z]/.test(password), { message: "Must have atleast one lowercase letter" })
            .refine((password) => /[0-9]/.test(password), { message: "Must have atleast one digit" })
            .refine((password) => /[!@#$%^&*]/.test(password), { message: "Must have atleast one special character " }),
        firstname: zod_1.z.string().min(3).max(10),
        lastname: zod_1.z.string().min(3).max(10).optional()
    });
    const parseDataWithSchema = userSchema.safeParse(req.body);
    if (!parseDataWithSchema.success) {
        const errors = parseDataWithSchema.error.errors.map((err) => ({
            field: err.path.join("."),
            message: err.message
        }));
        res.status(411).json({
            message: "Error in input format",
            error: errors
        });
        return;
    }
    try {
        const hashedPassword = yield bcrypt_1.default.hash(password, 5);
        yield db_1.AdminModel.create({
            email: email,
            password: hashedPassword,
            firstname: firstname,
            lastname: lastname
        });
        res.status(200).send("User successfully signed up");
        return;
    }
    catch (err) {
        if (err instanceof Error) {
            if (err.code === 11000) {
                res.status(403).send("User already exists");
                return;
            }
            else {
                res.status(500).send(`Error signing up ${err.message}`);
                return;
            }
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
}));
// Admin signin endpoint
exports.adminRouter.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
        const user = yield db_1.AdminModel.findOne({
            email: email
        });
        if (!user) {
            res.status(401).send("User not found");
            return;
        }
        const passwordMatch = yield bcrypt_1.default.compare(password, user.password);
        if (passwordMatch) {
            const token = jsonwebtoken_1.default.sign({
                id: user._id
            }, ADMIN_JWT_SECRET);
            res.status(200).json({
                message: "User successfully logged in",
                token: token
            });
            return;
        }
        else {
            res.status(403).send("Incorrect password");
            return;
        }
    }
    catch (err) {
        if (err instanceof Error) {
            res.status(500).send(`Error logging in ${err.message}`);
            return;
        }
        res.status(500).send("An unknown error occurred");
        return;
    }
}));
