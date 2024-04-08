import { Router } from "express";
import { createMessage, getDefinedMessages, getMessages } from "../controller/chat.controller";
import { respond } from "../utils/response";

export default function chatRoute() {
  const router = Router();

  router.get("/messages/defined", respond(getDefinedMessages));
  router.post("/messages/:room_id/:user_id", respond(createMessage));
  router.get("/messages/:room_id", respond(getMessages));

  return router;
}
