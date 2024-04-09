"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const task_controller_1 = require("../controller/task.controller");
function placeRoute() {
    const router = (0, express_1.Router)();
    router.get("/", (0, response_1.respond)(task_controller_1.getTasks));
    router.post("/", (0, response_1.respond)(task_controller_1.createTask));
    router.get("/procedure", (0, response_1.respond)(task_controller_1.getProcedureList));
    router.get("/rtp", (0, response_1.respond)(task_controller_1.getRtpList));
    router.get("/:task_id", (0, response_1.respond)(task_controller_1.getTask));
    router.put("/:task_id", (0, response_1.respond)(task_controller_1.modifyTask));
    return router;
}
exports.default = placeRoute;
//# sourceMappingURL=task.route.js.map