"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const package_controller_1 = require("../controller/package.controller");
const membership_controller_1 = require("../controller/membership.controller");
function placeRoute() {
    const router = (0, express_1.Router)();
    router.get("/", (0, response_1.respond)(membership_controller_1.getMembershipByType));
    router.post("/", (0, response_1.respond)(package_controller_1.createPackage));
    router.get("/:package_id", (0, response_1.respond)(package_controller_1.getPackage));
    router.put("/:package_id", (0, response_1.respond)(package_controller_1.modifyPackage));
    return router;
}
exports.default = placeRoute;
//# sourceMappingURL=membership.route.js.map