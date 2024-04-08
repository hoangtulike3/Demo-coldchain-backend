import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { Server as SocketServer } from "socket.io";
import { RoomRepo } from "../repository/room.repository";
import { ChatRepo } from "../repository/chat.repository";

export default async function initializeSocket(
  server: HttpServer | HttpsServer
): Promise<SocketServer | null | undefined> {
  const io = new SocketServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });
  const chatNamespace = io.of("/chat/messages");

  chatNamespace.on("connection", async (socket) => {
    console.log("A user connected, socket id:", socket.id);

    socket.on("join room", (data) => {
      const { roomId } = data;
      socket.join(roomId);
      console.log(`Socket ${socket.id} joined room ${roomId}`);
    });

    socket.on("chat message", async (data) => {
      try {
        if (!data.userId || !data.roomId || !data.message) {
          console.error("Missing fields in the message data");
          socket.emit("error", "Missing fields in the message data");
          return;
        }

        const { message, userId, roomId } = data;
        console.log(`Attempting to add message to room ${roomId} by user ${userId}`);

        const isParticipant = await RoomRepo.isParticipant(userId, roomId);
        console.log(isParticipant);
        if (!isParticipant) {
          console.error(`User ${userId} is not a participant of the room ${roomId}.`);
          socket.emit("error", `User is not a participant of the room ${roomId}.`);
          return;
        }

        const newMessage = await ChatRepo.addMessage(message, userId, roomId);
        console.log(`New message added to room ${roomId}:`, newMessage);
        chatNamespace.to(roomId).emit("chat message", newMessage);
      } catch (e: any) {
        console.error("Error handling chat message:", e);
        socket.emit("error", e.message);
      }
    });

    socket.on("get messages", async (data) => {
      try {
        const { roomId, search } = data;
        console.log(`Fetching messages for room ${roomId}`);

        const messages = await ChatRepo.getMessages(roomId, search);
        console.log(`Fetched messages for room ${roomId}:`, messages);

        socket.emit("room messages", messages);
      } catch (e: any) {
        console.error("Error fetching messages:", e);
        socket.emit("error", "Error fetching messages");
      }
    });

    socket.on("disconnect", () => {
      console.log(`User disconnected, socket id: ${socket.id}`);
    });
  });

  return io;
}
