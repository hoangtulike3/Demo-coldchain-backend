/// <reference types="node" />
/// <reference types="node" />
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { Server as SocketServer } from "socket.io";
export default function initializeSocket(server: HttpServer | HttpsServer): Promise<SocketServer | null | undefined>;
