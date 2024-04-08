/**
 *  SPDX-License-Identifier: Apache-2.0
 */

import express, { Router } from "express";
import { respond } from "../utils/response";
import {
  getUser,
  getUsers,
  addUser,
  modifyUser,
  getMyAccountDetail,
  updateMyAccountDetail,
  generateWorkID,
  updateMyAccountStatus,
} from "../controller/users.controller";
import multer from "multer";

export default function userRoute(): Router {
  const router = express.Router({ mergeParams: true });
  const upload = multer({ storage: multer.memoryStorage() });

  router.route("/").get(respond(getUsers));
  router.route("/profile").get(respond(getMyAccountDetail));
  router.put("/profile", upload.fields([{ name: "photo", maxCount: 1 }]), respond(updateMyAccountDetail));
  router.route("/work_id").get(respond(generateWorkID));
  router.route("/status").patch(respond(updateMyAccountStatus));
  router.route("/").post(respond(addUser));
  router.route("/:userId").get(respond(getUser));
  router.route("/:userId").put(respond(modifyUser));

  return router;
}
