"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAccessToken = exports.signAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const getJwtSecret = () => {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error("JWT_SECRET no configurado");
    }
    return secret;
};
const getExpiresIn = (remember) => {
    if (remember && process.env.JWT_EXPIRES_IN_REMEMBER) {
        return process.env.JWT_EXPIRES_IN_REMEMBER;
    }
    return process.env.JWT_EXPIRES_IN ?? "1d";
};
const signAccessToken = (payload, remember) => jsonwebtoken_1.default.sign(payload, getJwtSecret(), {
    expiresIn: getExpiresIn(remember),
});
exports.signAccessToken = signAccessToken;
const verifyAccessToken = (token) => jsonwebtoken_1.default.verify(token, getJwtSecret());
exports.verifyAccessToken = verifyAccessToken;
