import express, { Router } from "express";
import { respond } from "../utils/response";
import { defaultThumbnail } from "../controller/config.controller";

export default function configRoute(): Router {
  const router = express.Router({ mergeParams: true });

  router.route("/default_thumbnail").get(respond(defaultThumbnail));

  return router;
}
