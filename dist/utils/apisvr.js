"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.APIServer = void 0;
/* eslint-disable new-cap */
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const express_1 = __importDefault(require("express"));
const jwt_middlewares_1 = __importDefault(require("../middleware/jwt.middlewares"));
const auth_route_1 = __importDefault(require("../routes/auth.route"));
const users_route_1 = __importDefault(require("../routes/users.route"));
const chat_route_1 = __importDefault(require("../routes/chat.route"));
const places_route_1 = __importDefault(require("../routes/places.route"));
const room_route_1 = __importDefault(require("../routes/room.route"));
const package_route_1 = __importDefault(require("../routes/package.route"));
const task_route_1 = __importDefault(require("../routes/task.route"));
const membership_route_1 = __importDefault(require("../routes/membership.route"));
const response_1 = require("./response");
const error_1 = require("./error");
const config_1 = __importDefault(require("../config"));
const logger_1 = __importDefault(require("./logger"));
const socket_1 = __importDefault(require("../utils/socket"));
const chat_controller_1 = require("../controller/chat.controller");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const connect_redis_1 = __importDefault(require("connect-redis"));
const redis_1 = require("../config/redis");
require("../utils/qr");
require("../utils/s3");
class APIServer {
    constructor() {
        this.app = (0, express_1.default)();
        this.connections = [];
        if (config_1.default.api.sslEnabled) {
            const sslKeyPath = path_1.default.join(config_1.default.api.sslCertsPath, "/privatekey.pem");
            const sslCertPath = path_1.default.join(config_1.default.api.sslCertsPath, "/certificate.pem");
            const options = {
                key: fs_1.default.readFileSync(sslKeyPath).toString(),
                cert: fs_1.default.readFileSync(sslCertPath).toString(),
            };
            this.server = https_1.default.createServer(options, this.app);
            this.protocol = "HTTPS";
        }
        else {
            this.server = http_1.default.createServer(this.app);
            this.protocol = "HTTP";
        }
    }
    /** API 서버 초기화 */
    async initialize() {
        this.app.set("trust proxy", 1);
        this.app.set("etag", false);
        // adding Helmet to enhance your Rest API's security
        this.app.use((0, helmet_1.default)());
        // only parses json
        this.app.use(express_1.default.json());
        // only parses urlencoded bodies
        this.app.use(express_1.default.urlencoded({ extended: true }));
        // enabling CORS for all requests
        this.app.use((0, cors_1.default)());
        this.app.use(express_1.default.static("public"));
        const RedisStoreInstance = new connect_redis_1.default({
            client: redis_1.client,
        });
        // Initialize session middleware with RedisStore
        this.app.use((0, express_session_1.default)({
            store: RedisStoreInstance,
            secret: "secret",
            resave: false,
            saveUninitialized: false,
            cookie: { secure: config_1.default.api.sslEnabled }, // 환경에 따라 조정
        }));
        this.app.use(passport_1.default.initialize());
        this.app.use(passport_1.default.session()); // 이 줄 추가
        // adding morgan to log HTTP requests
        this.app.use((0, morgan_1.default)(config_1.default.env !== "development" ? "combined" : "dev", {
            skip: (_req, res) => config_1.default.env !== "development" && res.statusCode < 400,
            stream: { write: (message) => logger_1.default.http(message.trimEnd()) },
        }));
        // attempt to compress response bodies for all reques
        this.app.use((0, compression_1.default)());
        // IP rate-limiting middleware for Express
        this.app.use((0, express_rate_limit_1.default)({
            windowMs: config_1.default.api.rateLimitWindowMs,
            max: config_1.default.api.rateLimitMax,
        }));
        this.io = await (0, socket_1.default)(this.server);
        // Initializing middlewares
        const auth = (0, jwt_middlewares_1.default)();
        this.app.use(express_1.default.static("public"));
        (0, chat_controller_1.setIO)(this.io);
        // Initializing router handlers
        this.app.get("/", (_req, res) => res.sendStatus(200));
        this.app.use("/auth", (0, auth_route_1.default)());
        this.app.use("/users", auth, (0, users_route_1.default)());
        this.app.use("/chat", auth, (0, chat_route_1.default)());
        this.app.use("/places", auth, (0, places_route_1.default)());
        this.app.use("/rooms", auth, (0, room_route_1.default)());
        this.app.use("/packages", auth, (0, package_route_1.default)());
        this.app.use("/tasks", auth, (0, task_route_1.default)());
        this.app.use("/membership", auth, (0, membership_route_1.default)());
        // catch 404 and forward to error handler
        this.app.use((_req, res) => res.sendStatus(404));
        // error handler
        this.app.use((err, req, res, next) => {
            try {
                res.locals.error = req.app.get("env") === "development" ? err : {};
                res.locals.message = err.message;
                if (!err.status)
                    err.status = 500;
                if (!err.code)
                    err.code = error_1.Code.UNKNOWN_ERROR;
                (0, response_1.raiseError)(res, err.status, err.code, err.message);
            }
            catch (err) {
                next(err);
            }
        });
    }
    /** 서버 시작 */
    async listen() {
        return new Promise((resolve) => {
            this.server.listen(config_1.default.api.port, "0.0.0.0", () => {
                const addr = this.server.address();
                const bind = typeof addr === "string" ? "pipe " + addr : addr ? "port " + addr.port : "";
                logger_1.default.info("%s Server listen on %s.", this.protocol, bind);
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
    async close() {
        return new Promise((resolve) => {
            const addr = this.server.address();
            const bind = typeof addr === "string" ? "pipe " + addr : addr ? "port " + addr.port : "";
            this.server.close(() => {
                logger_1.default.info("%s Server closed on %s.", this.protocol, bind);
                resolve();
            });
            this.connections.forEach((conn) => conn.end());
            setTimeout(() => this.connections.forEach((conn) => conn.destroy()), 5000);
        });
    }
}
exports.APIServer = APIServer;
//# sourceMappingURL=apisvr.js.map