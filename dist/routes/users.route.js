"use strict";
/**
 *  SPDX-License-Identifier: Apache-2.0
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const response_1 = require("../utils/response");
const users_controller_1 = require("../controller/users.controller");
const multer_1 = __importDefault(require("multer"));
function userRoute() {
    const router = express_1.default.Router({ mergeParams: true });
    const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
    router.route("/").get((0, response_1.respond)(users_controller_1.getUsers));
    router.route("/profile").get((0, response_1.respond)(users_controller_1.getMyAccountDetail));
    router.put("/profile", upload.fields([{ name: "photo", maxCount: 1 }]), (0, response_1.respond)(users_controller_1.updateMyAccountDetail));
    router.route("/work_id").get((0, response_1.respond)(users_controller_1.generateWorkID));
    router.route("/status").patch((0, response_1.respond)(users_controller_1.updateMyAccountStatus));
    router.route("/").post((0, response_1.respond)(users_controller_1.addUser));
    router.route("/:userId").get((0, response_1.respond)(users_controller_1.getUser));
    router.route("/:userId").put((0, response_1.respond)(users_controller_1.modifyUser));
    return router;
}
exports.default = userRoute;
//# sourceMappingURL=users.route.js.map