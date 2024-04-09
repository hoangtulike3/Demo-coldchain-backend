"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const places_controller_1 = require("../controller/places.controller");
const response_1 = require("../utils/response");
// import { generateQR } from "../utils/qr";
const multer_1 = __importDefault(require("multer"));
function placeRoute() {
    const router = (0, express_1.Router)();
    const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
    router.get("/", (0, response_1.respond)(places_controller_1.getPlaces));
    router.post("/", upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "photos", maxCount: 10 },
    ]), (0, response_1.respond)(places_controller_1.createPlace));
    router.get("/place_type", (0, response_1.respond)(places_controller_1.getPlaceType));
    router.get("/place_category", (0, response_1.respond)(places_controller_1.getPlaceCategory));
    router.get("/service", (0, response_1.respond)(places_controller_1.getService));
    router.patch("/:place_id/notification", (0, response_1.respond)(places_controller_1.patchToggle));
    router.put("/:place_id", upload.fields([
        { name: "photo", maxCount: 1 },
        { name: "photos", maxCount: 10 },
    ]), (0, response_1.respond)(places_controller_1.modifyPlace));
    router.get("/:place_id", (0, response_1.respond)(places_controller_1.getPlace));
    return router;
}
exports.default = placeRoute;
// router.get("/qr/generate", async (req, res) => {
//   const url = "http://localhost:3000/places/qr"; // QR 코드에 포함될 URL
//   try {
//     const qrImage = await generateQR(url);
//     res.send(`<img src="${qrImage}">`); // HTML로 QR 코드 이미지 응답
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Error generating QR code");
//   }
// });
// // QR 코드 스캔 시 반환될 JSON 데이터 경로
// router.get("/qr", (req, res) => {
//   const data = {
//     name: "kim",
//     age: "13",
//   };
//   res.json(data); // JSON 데이터 반환
// });
//# sourceMappingURL=places.route.js.map