"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRoomParticipants = exports.createRoom = exports.getRoom = exports.getRooms = void 0;
const room_repository_1 = require("../repository/room.repository");
const response_1 = require("../utils/response");
// 내가 들어가 있는 채팅방 전체 조회
const getRooms = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        let pageSize = 10;
        const searchName = req.query.search_name || "";
        const roomRepo = new room_repository_1.RoomRepo();
        const { rooms, totalCount } = await roomRepo.getRooms(userId, page, pageSize, searchName);
        if ((page - 1) * pageSize + rooms.length >= totalCount) {
            pageSize = rooms.length;
        }
        (0, response_1.response)(res, { rooms, totalCount, page, pageSize });
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getRooms = getRooms;
// 채팅방 조회
const getRoom = async (req, res, next) => {
    try {
        const roomId = req.params.room_id;
        const roomRepo = new room_repository_1.RoomRepo();
        const room = await roomRepo.getRoom(roomId);
        (0, response_1.response)(res, room);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getRoom = getRoom;
// 채팅방 개설
const createRoom = async (req, res, next) => {
    try {
        const roomObj = req.body;
        const roomRepo = new room_repository_1.RoomRepo();
        const createdRoom = await roomRepo.addRoom(roomObj);
        (0, response_1.response)(res, { room: createdRoom });
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.createRoom = createRoom;
// export const modifyRoom = async (req: Request, res: Response, next: NextFunction) => {
//   try {
//     const roomId = parseInt(req.params.room_id);
//     const roomObj: object = req.body;
//     const roomRepo = new RoomRepo();
//     const room: any = await roomRepo.modifyRoom(roomObj, roomId);
//     response(res, room);
//   } catch (e) {
//     defaultError(res, e);
//   }
// };
// 채팅방 참여자 조회
const getRoomParticipants = async (req, res, next) => {
    try {
        const roomId = req.params.room_id;
        const roomRepo = new room_repository_1.RoomRepo();
        const roomParticipants = await roomRepo.getRoomParticipants(roomId);
        (0, response_1.response)(res, roomParticipants);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getRoomParticipants = getRoomParticipants;
//# sourceMappingURL=room.controller.js.map