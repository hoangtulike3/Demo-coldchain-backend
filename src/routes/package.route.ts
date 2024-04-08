import { Router } from "express";
import { respond } from "../utils/response";
import {
  createPackage,
  deletePackage,
  getPackage,
  getPackageFilterList,
  getPackages,
  modifyPackage,
} from "../controller/package.controller";
import multer from "multer";

export default function placeRoute() {
  const router = Router();
  const upload = multer({ storage: multer.memoryStorage() });

  router.get("/", respond(getPackages));
  router.post(
    "/",
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "photos", maxCount: 10 },
    ]),
    respond(createPackage)
  );
  router.get("/filter_list", respond(getPackageFilterList));
  router.get("/:package_id", respond(getPackage));
  router.put(
    "/:package_id",
    upload.fields([
      { name: "photo", maxCount: 1 },
      { name: "photos", maxCount: 10 },
    ]),
    respond(modifyPackage)
  );
  router.delete("/:package_id", respond(deletePackage));

  return router;
}
