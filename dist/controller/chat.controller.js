"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefinedMessages = exports.markMessageAsRead = exports.getMessages = exports.createMessage = exports.getIO = exports.setIO = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const error_1 = require("../utils/error");
const chat_repository_1 = require("../repository/chat.repository");
const response_1 = require("../utils/response");
const room_repository_1 = require("../repository/room.repository");
let io = null;
const setIO = (socketIO) => {
    io = socketIO;
};
exports.setIO = setIO;
const getIO = () => io;
exports.getIO = getIO;
const createMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const roomId = req.params.room_id;
        const userId = req.params.user_id;
        const isParticipant = await room_repository_1.RoomRepo.isParticipant(roomId, userId);
        if (!isParticipant) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.NOT_FOUND));
        }
        const newMessage = await chat_repository_1.ChatRepo.addMessage(message, roomId, userId);
        (0, response_1.response)(res, newMessage);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.createMessage = createMessage;
const getMessages = async (req, res) => {
    try {
        const roomId = req.params.room_id;
        const userId = req.user.id;
        const search = req.query.search || "";
        const isParticipant = await room_repository_1.RoomRepo.isParticipant(userId, roomId);
        if (!isParticipant) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.NOT_FOUND));
        }
        const messages = await chat_repository_1.ChatRepo.getMessages(roomId, search);
        (0, response_1.response)(res, messages);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getMessages = getMessages;
const markMessageAsRead = async (req, res, io) => {
    const { messageId, userId } = req.body;
    try {
        const updatedMessage = await chat_repository_1.ChatRepo.markAsRead(messageId, userId);
        io.to(updatedMessage.roomId).emit("message read", { messageId, userId });
        (0, response_1.response)(res, updatedMessage);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.markMessageAsRead = markMessageAsRead;
const getDefinedMessages = async (req, res, next) => {
    try {
        const chatRepo = new chat_repository_1.ChatRepo();
        const definedMessages = await chatRepo.getDefinedMessages();
        // for (const message of definedMessages) {
        // }
        (0, response_1.response)(res, definedMessages);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getDefinedMessages = getDefinedMessages;
//# sourceMappingURL=chat.controller.js.map