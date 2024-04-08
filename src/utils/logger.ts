import "winston-daily-rotate-file";
import moment from "moment";
import winston, { Logger } from "winston";
import config from "../config";

winston.addColors({
  error: "red",
  warn: "yellow",
  info: "green",
  http: "magenta",
  verbose: "cyan",
  debug: "blue",
});

export const getLogger = (label: string): Logger => {
  // Formats
  const format = winston.format.combine(
    winston.format.label({ label }),
    winston.format.splat(),
    winston.format((info) => {
      info.timestamp = moment().tz(config.tz).format("YYYY-MM-DD HH:mm:ss Z");
      return info;
    })(),
    winston.format.printf(({ level, message, label, timestamp }) => {
      if (typeof message === "object") message = JSON.stringify(message);
      return `${timestamp} [${label}] ${level}: ${message}`;
    })
  );

  // Options
  const options = {
    console: {
      level: config.log.level,
      handleExceptions: true,
      format: winston.format.combine(winston.format.colorize(), format),
    },
    file: {
      level: config.log.level,
      dirname: "logs",
      filename: `${config.env}.%DATE%.log`,
      datePattern: config.log.datePattern,
      maxFiles: config.log.maxFiles,
      maxSize: config.log.maxSize,
      zippedArchive: config.log.zippedArchive,
      handleExceptions: true,
      format,
    },
    error: {
      level: "error",
      dirname: "logs/error",
      filename: `${config.env}.%DATE%.error.log`,
      datePattern: config.log.datePattern,
      maxFiles: config.log.maxFiles,
      maxSize: config.log.maxSize,
      zippedArchive: config.log.zippedArchive,
      rotationFormat: {},
      format,
    },
  };

  // Transports
  const transports = [];
  transports.push(new winston.transports.Console(options.console));
  transports.push(new winston.transports.DailyRotateFile(options.file));
  if (config.log.errorFiles) {
    transports.push(new winston.transports.DailyRotateFile(options.error));
  }

  // Logger
  return winston.createLogger({ transports });
};

const logger = getLogger(config.appId);

export default logger;
