import "winston-daily-rotate-file";
import winston, { Logger } from "winston";
export declare const getLogger: (label: string) => Logger;
declare const logger: winston.Logger;
export default logger;
