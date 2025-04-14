"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminAuth = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
dotenv_1.default.config();
const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET;
const adminAuth = (req, res, next) => {
    const token = req.get("Authorization");
    const parsedToken = token === null || token === void 0 ? void 0 : token.split(" ")[1];
    if (parsedToken) {
        jsonwebtoken_1.default.verify(parsedToken, ADMIN_JWT_SECRET, (err, decodedData) => {
            if (err) {
                res.status(401).send("Unauthorized user");
                return;
            }
            else {
                req.userId = decodedData.id;
                next();
            }
        });
    }
    else {
        res.status(403).send("Token not found");
        return;
    }
};
exports.adminAuth = adminAuth;
