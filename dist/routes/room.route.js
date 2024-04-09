"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const room_controller_1 = require("../controller/room.controller");
const response_1 = require("../utils/response");
function placeRoute() {
    const router = (0, express_1.Router)();
    router.get("/", (0, response_1.respond)(room_controller_1.getRooms));
    router.post("/", (0, response_1.respond)(room_controller_1.createRoom));
    router.get("/:room_id", (0, response_1.respond)(room_controller_1.getRoom));
    // router.put("/:room_id", respond(modifyRoom));
    router.get("/:room_id/participants", (0, response_1.respond)(room_controller_1.getRoomParticipants));
    return router;
}
exports.default = placeRoute;
//# sourceMappingURL=room.route.js.map