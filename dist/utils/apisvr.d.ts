/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import http from "http";
import https from "https";
import { Duplex } from "stream";
import { Server as SocketServer } from "socket.io";
import "../utils/qr";
import "../utils/s3";
export declare class APIServer {
    readonly app: import("express-serve-static-core").Express;
    readonly protocol: string;
    readonly server: http.Server | https.Server;
    readonly connections: Duplex[];
    io: SocketServer | null | undefined;
    constructor();
    /** API 서버 초기화 */
    initialize(): Promise<void>;
    /** 서버 시작 */
    listen(): Promise<void>;
    /** 서버 중지 */
    close(): Promise<void>;
}
