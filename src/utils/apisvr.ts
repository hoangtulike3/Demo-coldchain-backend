/* eslint-disable new-cap */
import fs from "fs";
import path from "path";
import cors from "cors";
import http from "http";
import https from "https";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
import RateLimit from "express-rate-limit";
import { Duplex } from "stream";
import { HttpError } from "http-errors";
import express, { Request, Response } from "express";
import authCheck from "../middleware/jwt.middlewares";
import authRoute from "../routes/auth.route";
import userRoute from "../routes/users.route";
import chatRoute from "../routes/chat.route";
import placeRoute from "../routes/places.route";
import roomRoute from "../routes/room.route";
import packageRoute from "../routes/package.route";
import taskRoute from "../routes/task.route";
import membershipRoute from "../routes/membership.route";
import { raiseError } from "./response";
import { Code } from "./error";
import config from "../config";
import logger from "./logger";
import { Server as SocketServer } from "socket.io";
import initializeSocket from "../utils/socket";
import { setIO } from "../controller/chat.controller";
import passport from "passport";
import session from "express-session";
import RedisStore from "connect-redis";
import { client as redisClient } from "../config/redis";
import "../utils/qr";
import "../utils/s3";

export class APIServer {
  readonly app = express();
  readonly protocol: string;
  readonly server: http.Server | https.Server;
  readonly connections: Duplex[] = [];
  io: SocketServer | null | undefined;

  constructor() {
    if (config.api.sslEnabled) {
      const sslKeyPath = path.join(config.api.sslCertsPath, "/privatekey.pem");
      const sslCertPath = path.join(config.api.sslCertsPath, "/certificate.pem");
      const options = {
        key: fs.readFileSync(sslKeyPath).toString(),
        cert: fs.readFileSync(sslCertPath).toString(),
      };
      this.server = https.createServer(options, this.app);
      this.protocol = "HTTPS";
    } else {
      this.server = http.createServer(this.app);
      this.protocol = "HTTP";
    }
  }

  /** API 서버 초기화 */
  async initialize(): Promise<void> {
    this.app.set("trust proxy", 1);
    this.app.set("etag", false);

    // adding Helmet to enhance your Rest API's security
    this.app.use(helmet());

    // only parses json
    this.app.use(express.json());

    // only parses urlencoded bodies
    this.app.use(express.urlencoded({ extended: true }));

    // enabling CORS for all requests
    this.app.use(cors());

    this.app.use(express.static("public"));

    const RedisStoreInstance = new RedisStore({
      client: redisClient,
    });

    // Initialize session middleware with RedisStore
    this.app.use(
      session({
        store: RedisStoreInstance,
        secret: "secret",
        resave: false,
        saveUninitialized: false, // 변경 가능
        cookie: { secure: config.api.sslEnabled }, // 환경에 따라 조정
      })
    );
    this.app.use(passport.initialize());
    this.app.use(passport.session()); // 이 줄 추가

    // adding morgan to log HTTP requests
    this.app.use(
      morgan(config.env !== "development" ? "combined" : "dev", {
        skip: (_req, res) => config.env !== "development" && res.statusCode < 400,
        stream: { write: (message: string) => logger.http(message.trimEnd()) },
      })
    );

    // attempt to compress response bodies for all reques
    this.app.use(compression());

    // IP rate-limiting middleware for Express
    this.app.use(
      RateLimit({
        windowMs: config.api.rateLimitWindowMs,
        max: config.api.rateLimitMax,
      })
    );

    this.io = await initializeSocket(this.server);

    // Initializing middlewares
    const auth = authCheck();
    this.app.use(express.static("public"));

    setIO(this.io);

    // Initializing router handlers
    this.app.get("/", (_req, res) => res.sendStatus(200));
    this.app.use("/auth", authRoute());
    this.app.use("/users", auth, userRoute());
    this.app.use("/chat", auth, chatRoute());
    this.app.use("/places", auth, placeRoute());
    this.app.use("/rooms", auth, roomRoute());
    this.app.use("/packages", auth, packageRoute());
    this.app.use("/tasks", auth, taskRoute());
    this.app.use("/membership", auth, membershipRoute());

    // catch 404 and forward to error handler
    this.app.use((_req: Request, res: Response) => res.sendStatus(404));

    // error handler
    this.app.use((err: HttpError, req: express.Request, res: express.Response, next: express.NextFunction) => {
      try {
        res.locals.error = req.app.get("env") === "development" ? err : {};
        res.locals.message = err.message;
        if (!err.status) err.status = 500;
        if (!err.code) err.code = Code.UNKNOWN_ERROR;
        raiseError(res, err.status, err.code, err.message);
      } catch (err) {
        next(err);
      }
    });
  }

  /** 서버 시작 */
  async listen(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(config.api.port, "0.0.0.0", () => {
        const addr = this.server.address();
        const bind = typeof addr === "string" ? "pipe " + addr : addr ? "port " + addr.port : "";
        logger.info("%s Server listen on %s.", this.protocol, bind);
        resolve();
      });

      this.server.on("connection", (connection) => {
        this.connections.push(connection);
        connection.on("close", () => {
          let index = 0;
          while (index < this.connections.length) {
            if (this.connections[index] !== connection) {
              index++;
              continue;
            }
            delete this.connections[index];
          }
        });
      });
    });
  }

  /** 서버 중지 */
  async close(): Promise<void> {
    return new Promise((resolve) => {
      const addr = this.server.address();
      const bind = typeof addr === "string" ? "pipe " + addr : addr ? "port " + addr.port : "";
      this.server.close(() => {
        logger.info("%s Server closed on %s.", this.protocol, bind);
        resolve();
      });
      this.connections.forEach((conn) => conn.end());
      setTimeout(() => this.connections.forEach((conn) => conn.destroy()), 5000);
    });
  }
}
