"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const response_1 = require("../utils/response");
const package_controller_1 = require("../controller/package.controller");
const multer_1 = __importDefault(require("multer"));
function placeRoute() {
    const router = (0, express_1.Router)();
    const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
    router.get("/", (0, response_1.respond)(package_controller_1.getPackages));
    router.post("/", upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "photos", maxCount: 10 },
    ]), (0, response_1.respond)(package_controller_1.createPackage));
    router.get("/filter_list", (0, response_1.respond)(package_controller_1.getPackageFilterList));
    router.get("/:package_id", (0, response_1.respond)(package_controller_1.getPackage));
    router.put("/:package_id", upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "photos", maxCount: 10 },
    ]), (0, response_1.respond)(package_controller_1.modifyPackage));
    router.delete("/:package_id", (0, response_1.respond)(package_controller_1.deletePackage));
    return router;
}
exports.default = placeRoute;
//# sourceMappingURL=package.route.js.map