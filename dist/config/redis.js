"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
exports.client = new ioredis_1.default(Number(process.env.REDIS_PORT) || 6399, process.env.REDIS_HOST || "");
//# sourceMappingURL=redis.js.map