"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./utils/global");
const apisvr_1 = require("./utils/apisvr");
const logger_1 = __importDefault(require("./utils/logger"));
const config_1 = __importDefault(require("./config"));
let apiServer;
let isStopping = false;
async function main() {
    logger_1.default.info("==========================================================");
    logger_1.default.info(`START [${config_1.default.projectId}/${config_1.default.appId}/${config_1.default.env}]`);
    await start().catch((e) => handleError(e));
    process.on("unhandledRejection", handleError);
    process.on("uncaughtException", handleError);
    process.on("SIGTERM", shutDown); // kill
    process.on("SIGINT", shutDown); // Ctrl-C
}
// 프로세스 시작
async function start() {
    logger_1.default.info("Start Process.");
    apiServer = new apisvr_1.APIServer();
    await apiServer.initialize();
    await apiServer.listen();
}
// 프로그램 종료
const shutDown = (exitCode) => {
    if (isStopping)
        return;
    isStopping = true;
    logger_1.default.info("Received kill signal, shutting down gracefully");
    apiServer?.close().then(() => {
        logger_1.default.warn("Process exit. (%s)", exitCode);
        process.exit(exitCode);
    });
};
// 프로그램 오류 처리
const handleError = (error) => {
    logger_1.default.error("!!!!!!! Applicaiton Error");
    logger_1.default.error(error.message);
    logger_1.default.error(error.stack);
    setTimeout(() => shutDown(1), 2000);
};
main();
//# sourceMappingURL=index.js.map