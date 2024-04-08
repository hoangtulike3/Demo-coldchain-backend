import { Router } from "express";
import {
  createPlace,
  getPlace,
  getPlaceCategory,
  getPlaceType,
  getPlaces,
  getService,
  modifyPlace,
  patchToggle,
} from "../controller/places.controller";
import { respond } from "../utils/response";
// import { generateQR } from "../utils/qr";
import multer from "multer";

export default function placeRoute() {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });

  router.get("/", respond(getPlaces));
  router.post(
    "/",
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "photos", maxCount: 10 },
    ]),
    respond(createPlace)
  );
  router.get("/place_type", respond(getPlaceType));
  router.get("/place_category", respond(getPlaceCategory));
  router.get("/service", respond(getService));
  router.patch("/:place_id/notification", respond(patchToggle));
  router.put(
    "/:place_id",
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "photos", maxCount: 10 },
    ]),
    respond(modifyPlace)
  );
  router.get("/:place_id", respond(getPlace));

  return router;
}

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
