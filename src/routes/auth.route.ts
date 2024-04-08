import express, { Router } from "express";
import { login, refreshToken, googleLogin, googleSignup } from "../controller/auth.controller";
import { respond } from "../utils/response";

export default function authRoute(): Router {
  const router = express.Router({ mergeParams: true });
  router.post("/login", respond(login));
  router.post("/refresh", respond(refreshToken));
  router.post("/google/signup", googleSignup);
  router.post("/google/login", googleLogin);

  return router;
}
