import createError from "http-errors";
import { NextFunction, Request, Response } from "express";
import { getError, Code } from "../utils/error";
import { ChatRepo } from "../repository/chat.repository";
import { defaultError, response } from "../utils/response";
import { RoomRepo } from "../repository/room.repository";
import { User } from "../interface/User";

let io: any = null;

export const setIO = (socketIO: any) => {
  io = socketIO;
};

export const getIO = () => io;

export const createMessage = async (req: Request, res: Response) => {
  try {
    const { message } = req.body;
    const roomId: string = req.params.room_id;
    const userId: string = req.params.user_id;

    const isParticipant = await RoomRepo.isParticipant(roomId, userId);
    if (!isParticipant) {
      throw createError(401, getError(Code.NOT_FOUND));
    }

    const newMessage = await ChatRepo.addMessage(message, roomId, userId);

    response(res, newMessage);
  } catch (e) {
    defaultError(res, e);
  }
};

export const getMessages = async (req: Request, res: Response) => {
  try {
    const roomId: string = req.params.room_id;
    const userId = (req.user as User).id;
    const search: string = (req.query.search as string) || "";

    const isParticipant = await RoomRepo.isParticipant(userId, roomId);
    if (!isParticipant) {
      throw createError(401, getError(Code.NOT_FOUND));
    }

    const messages = await ChatRepo.getMessages(roomId, search);

    response(res, messages);
  } catch (e) {
    defaultError(res, e);
  }
};

export const markMessageAsRead = async (req: Request, res: Response, io: any) => {
  const { messageId, userId } = req.body;
  try {
    const updatedMessage = await ChatRepo.markAsRead(messageId, userId);
    io.to(updatedMessage.roomId).emit("message read", { messageId, userId });

    response(res, updatedMessage);
  } catch (e) {
    defaultError(res, e);
  }
};

export const getDefinedMessages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const chatRepo = new ChatRepo();
    const definedMessages = await chatRepo.getDefinedMessages();
    // for (const message of definedMessages) {

    // }

    response(res, definedMessages);
  } catch (e) {
    defaultError(res, e);
  }
};
