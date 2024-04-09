"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getError = exports.ErrorEx = exports.errorMessage = exports.Code = void 0;
const util_1 = __importDefault(require("util"));
var Code;
(function (Code) {
    Code[Code["PARAMETER_NOT_FOUND"] = 1000] = "PARAMETER_NOT_FOUND";
    Code[Code["PARAMETER_INVALID"] = 1001] = "PARAMETER_INVALID";
    Code[Code["CLIENT_TYPE_INVALID"] = 1002] = "CLIENT_TYPE_INVALID";
    Code[Code["PLACE_NAME_DUPLICATED"] = 1003] = "PLACE_NAME_DUPLICATED";
    Code[Code["ACCESS_TOKEN_EXPIRED"] = 1100] = "ACCESS_TOKEN_EXPIRED";
    Code[Code["ACCESS_TOKEN_NOT_EXPIRED"] = 1101] = "ACCESS_TOKEN_NOT_EXPIRED";
    Code[Code["ACCESS_TOKEN_INVALID"] = 1102] = "ACCESS_TOKEN_INVALID";
    Code[Code["REFRESH_TOKEN_EXPIRED"] = 1103] = "REFRESH_TOKEN_EXPIRED";
    Code[Code["REFRESH_TOKEN_INVALID"] = 1104] = "REFRESH_TOKEN_INVALID";
    Code[Code["INVALID_CREDENTIAL"] = 1200] = "INVALID_CREDENTIAL";
    Code[Code["NOT_FOUND_USER"] = 1300] = "NOT_FOUND_USER";
    Code[Code["DUPLICATE_EMAIL"] = 1301] = "DUPLICATE_EMAIL";
    Code[Code["UN_AUTHORIZE"] = 1401] = "UN_AUTHORIZE";
    Code[Code["FORBIDDEN"] = 1403] = "FORBIDDEN";
    Code[Code["NOT_FOUND"] = 1302] = "NOT_FOUND";
    Code[Code["UNKNOWN_ERROR"] = 9999] = "UNKNOWN_ERROR";
})(Code = exports.Code || (exports.Code = {}));
exports.errorMessage = {
    [Code.PARAMETER_NOT_FOUND]: "Parameter Not Found: %s",
    [Code.PARAMETER_INVALID]: "Parameter Invalid: %s (supported: %s)",
    [Code.CLIENT_TYPE_INVALID]: "Client Type Invalid: %s",
    [Code.PLACE_NAME_DUPLICATED]: "Place Name Duplicated.",
    [Code.ACCESS_TOKEN_EXPIRED]: "Access token is expired",
    [Code.ACCESS_TOKEN_NOT_EXPIRED]: "Access token is not expired.",
    [Code.ACCESS_TOKEN_INVALID]: "Invalid Access Token",
    [Code.REFRESH_TOKEN_EXPIRED]: "Refresh token is expired",
    [Code.REFRESH_TOKEN_INVALID]: "Invalid Refresh Token",
    [Code.INVALID_CREDENTIAL]: "Invalid Credential",
    [Code.NOT_FOUND_USER]: "Not Found User: %s",
    [Code.DUPLICATE_EMAIL]: "Duplicate Email: %s",
    [Code.NOT_FOUND]: "Not Found: %s",
    [Code.UNKNOWN_ERROR]: "Unknown Error",
    [Code.UN_AUTHORIZE]: "Unauthorized",
    [Code.FORBIDDEN]: "FORBIDDEN",
};
class ErrorEx extends Error {
    constructor(code, message) {
        super();
        this.code = code;
        this.message = message;
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
    }
}
exports.ErrorEx = ErrorEx;
function getError(code, ...args) {
    const message = util_1.default.format(exports.errorMessage[code], ...args);
    return new ErrorEx(code, message);
}
exports.getError = getError;
//# sourceMappingURL=error.js.map