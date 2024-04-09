"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raiseError = exports.response = exports.defaultError = exports.success = exports.respond = void 0;
const http_status_1 = __importDefault(require("http-status"));
function respond(handler) {
    return async (req, res, next) => {
        try {
            return await handler(req, res, next);
        }
        catch (error) {
            return next(error);
        }
    };
}
exports.respond = respond;
const success = (res, statusCode, data) => {
    if (data == null) {
        res.status(statusCode).json({ success: true, statusCode });
    }
    else {
        res.status(statusCode).json({ success: true, statusCode, data });
    }
};
exports.success = success;
const defaultError = (res, msg, errorCode) => {
    let result = { result: false };
    if (msg) {
        const data = { data: msg };
        result = Object.assign(result, data);
    }
    return res.status(errorCode === undefined ? 400 : errorCode).json(result);
};
exports.defaultError = defaultError;
const response = (res, data, code = http_status_1.default.OK) => {
    let result = { result: true };
    if (typeof data === "object") {
        result = Object.assign(result, { data: data });
    }
    return res.status(code).json(result);
};
exports.response = response;
const raiseError = (res, statusCode, code, message) => {
    res.status(statusCode).json({ success: false, statusCode, errors: { code, message } });
};
exports.raiseError = raiseError;
//# sourceMappingURL=response.js.map