"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLogger = void 0;
require("winston-daily-rotate-file");
const moment_1 = __importDefault(require("moment"));
const winston_1 = __importDefault(require("winston"));
const config_1 = __importDefault(require("../config"));
winston_1.default.addColors({
    error: "red",
    warn: "yellow",
    info: "green",
    http: "magenta",
    verbose: "cyan",
    debug: "blue",
});
const getLogger = (label) => {
    // Formats
    const format = winston_1.default.format.combine(winston_1.default.format.label({ label }), winston_1.default.format.splat(), winston_1.default.format((info) => {
        info.timestamp = (0, moment_1.default)().tz(config_1.default.tz).format("YYYY-MM-DD HH:mm:ss Z");
        return info;
    })(), winston_1.default.format.printf(({ level, message, label, timestamp }) => {
        if (typeof message === "object")
            message = JSON.stringify(message);
        return `${timestamp} [${label}] ${level}: ${message}`;
    }));
    // Options
    const options = {
        console: {
            level: config_1.default.log.level,
            handleExceptions: true,
            format: winston_1.default.format.combine(winston_1.default.format.colorize(), format),
        },
        file: {
            level: config_1.default.log.level,
            dirname: "logs",
            filename: `${config_1.default.env}.%DATE%.log`,
            datePattern: config_1.default.log.datePattern,
            maxFiles: config_1.default.log.maxFiles,
            maxSize: config_1.default.log.maxSize,
            zippedArchive: config_1.default.log.zippedArchive,
            handleExceptions: true,
            format,
        },
        error: {
            level: "error",
            dirname: "logs/error",
            filename: `${config_1.default.env}.%DATE%.error.log`,
            datePattern: config_1.default.log.datePattern,
            maxFiles: config_1.default.log.maxFiles,
            maxSize: config_1.default.log.maxSize,
            zippedArchive: config_1.default.log.zippedArchive,
            rotationFormat: {},
            format,
        },
    };
    // Transports
    const transports = [];
    transports.push(new winston_1.default.transports.Console(options.console));
    transports.push(new winston_1.default.transports.DailyRotateFile(options.file));
    if (config_1.default.log.errorFiles) {
        transports.push(new winston_1.default.transports.DailyRotateFile(options.error));
    }
    // Logger
    return winston_1.default.createLogger({ transports });
};
exports.getLogger = getLogger;
const logger = (0, exports.getLogger)(config_1.default.appId);
exports.default = logger;
//# sourceMappingURL=logger.js.map