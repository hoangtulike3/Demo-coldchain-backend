import { Router } from "express";
import { respond } from "../utils/response";
import { createTask, getProcedureList, getRtpList, getTask, getTasks, modifyTask } from "../controller/task.controller";

export default function placeRoute() {
  const router = Router();

  router.get("/", respond(getTasks));
  router.post("/", respond(createTask));
  router.get("/procedure", respond(getProcedureList));
  router.get("/rtp", respond(getRtpList));
  router.get("/:task_id", respond(getTask));
  router.put("/:task_id", respond(modifyTask));

  return router;
}
