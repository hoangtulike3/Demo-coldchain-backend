"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redisJwt = __importStar(require("../utils/redis"));
const config_1 = __importDefault(require("../config"));
class JWToken {
    static async sign(payload) {
        const token = jsonwebtoken_1.default.sign(payload, this.secretKey, {
            algorithm: "HS256",
            expiresIn: this.expiresIn,
        });
        const decoded = jsonwebtoken_1.default.decode(token);
        if (decoded === null || typeof decoded === "string") {
            throw new Error(decoded || "Failed to issus token");
        }
        return { token, payload: decoded };
    }
    static async verify(token) {
        return new Promise((resolve) => {
            jsonwebtoken_1.default.verify(token, this.secretKey, (error, decoded) => {
                if (!decoded) {
                    decoded = jsonwebtoken_1.default.decode(token) || undefined;
                }
                if (!decoded || typeof decoded === "string") {
                    resolve({ success: false, error: this.JWT_MALFORMED });
                }
                else if (error) {
                    resolve({ success: false, error: error.message, payload: decoded });
                }
                else {
                    resolve({ success: true, payload: decoded });
                }
            });
        });
    }
    static async refresh(key) {
        const token = jsonwebtoken_1.default.sign({}, this.secretKey, {
            algorithm: "HS256",
            expiresIn: this.refreshExpiresIn,
        });
        const decoded = jsonwebtoken_1.default.decode(token);
        if (decoded === null || typeof decoded === "string") {
            throw new Error(decoded || "Failed to issus token");
        }
        await redisJwt.setValue(key, token);
        return { token, payload: decoded };
    }
    static async refreshVerify(key, token) {
        const data = await redisJwt.getValue(key);
        if (token !== data) {
            return { success: false, error: "access token not found" };
        }
        return this.verify(token);
    }
}
exports.default = JWToken;
JWToken.JWT_EXPIRED = "jwt expired";
JWToken.JWT_MALFORMED = "jwt malformed";
JWToken.secretKey = config_1.default.jwt.secretKey;
JWToken.expiresIn = config_1.default.jwt.expiresIn;
JWToken.refreshExpiresIn = config_1.default.jwt.refreshExpiresIn;
//# sourceMappingURL=jwt.js.map