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
exports.delKey = exports.setValue = exports.getValue = void 0;
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const redis = __importStar(require("../config/redis"));
moment_timezone_1.default.tz.setDefault("Asia/Seoul");
async function getValue(key) {
    return await redis.client.get(key);
}
exports.getValue = getValue;
async function setValue(key, value, expireSecond) {
    await redis.client.set(key, value);
    console.log(`Token set in Redis: key=${key}, value=${value}, expireSeconds=${expireSecond}`);
    if (expireSecond !== undefined) {
        await redis.client.expire(key, expireSecond);
    }
    else {
        await redis.client.expire(key, 14 * 24 * 60 * 60); // 14일
    }
    // 저장된 토큰 바로 조회하여 로그 출력
    const storedValue = await redis.client.get(key);
    console.log(`Stored token in Redis after set: ${storedValue}`);
}
exports.setValue = setValue;
async function delKey(key) {
    await redis.client.del(key);
}
exports.delKey = delKey;
//# sourceMappingURL=redis.js.map