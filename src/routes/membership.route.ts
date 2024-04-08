import { Router } from "express";
import { respond } from "../utils/response";
import { createPackage, getPackage, getPackages, modifyPackage } from "../controller/package.controller";
import { getMembershipByType } from "../controller/membership.controller";

export default function placeRoute() {
  const router = Router();

  router.get("/", respond(getMembershipByType));
  router.post("/", respond(createPackage));
  router.get("/:package_id", respond(getPackage));
  router.put("/:package_id", respond(modifyPackage));

  return router;
}
