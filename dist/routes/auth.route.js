"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_controller_1 = require("../controller/auth.controller");
const response_1 = require("../utils/response");
function authRoute() {
    const router = express_1.default.Router({ mergeParams: true });
    router.post("/login", (0, response_1.respond)(auth_controller_1.login));
    router.post("/refresh", (0, response_1.respond)(auth_controller_1.refreshToken));
    router.post("/google/signup", auth_controller_1.googleSignup);
    router.post("/google/login", auth_controller_1.googleLogin);
    return router;
}
exports.default = authRoute;
//# sourceMappingURL=auth.route.js.map