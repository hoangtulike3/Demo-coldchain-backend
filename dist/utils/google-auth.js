"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyIDToken = void 0;
const google_auth_library_1 = require("google-auth-library");
const config_1 = __importDefault(require("../config"));
const GoogleOAuth2 = new google_auth_library_1.OAuth2Client(config_1.default.google.clientIdWeb, config_1.default.google.clientSecret);
const verifyIDToken = async (idToken) => {
    try {
        const ticket = await GoogleOAuth2.verifyIdToken({ idToken, audience: config_1.default.google.clientIdWeb });
        const payload = ticket.getPayload();
        return payload;
    }
    catch (error) {
        console.error("Error verifying token:", error);
        return null;
    }
};
exports.verifyIDToken = verifyIDToken;
exports.default = GoogleOAuth2;
//# sourceMappingURL=google-auth.js.map