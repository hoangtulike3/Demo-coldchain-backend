import { Router } from "express";
import { createRoom, getRoom, getRoomParticipants, getRooms } from "../controller/room.controller";
import { respond } from "../utils/response";

export default function placeRoute() {
  const router = Router();

  router.get("/", respond(getRooms));
  router.post("/", respond(createRoom));
  router.get("/:room_id", respond(getRoom));
  // router.put("/:room_id", respond(modifyRoom));
  router.get("/:room_id/participants", respond(getRoomParticipants));

  return router;
}
