"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chat_controller_1 = require("../controller/chat.controller");
const response_1 = require("../utils/response");
function chatRoute() {
    const router = (0, express_1.Router)();
    router.get("/messages/defined", (0, response_1.respond)(chat_controller_1.getDefinedMessages));
    router.post("/messages/:room_id/:user_id", (0, response_1.respond)(chat_controller_1.createMessage));
    router.get("/messages/:room_id", (0, response_1.respond)(chat_controller_1.getMessages));
    return router;
}
exports.default = chatRoute;
//# sourceMappingURL=chat.route.js.map