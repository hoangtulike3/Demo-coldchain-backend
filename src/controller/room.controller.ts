import { RoomRepo } from "../repository/room.repository";
import { Request, Response, NextFunction } from "express";
import { defaultError, response } from "../utils/response";
import { User } from "../interface/User";

// 내가 들어가 있는 채팅방 전체 조회
export const getRooms = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = (req.user as User).id;
    const page: number = parseInt(req.query.page as string) || 1;
    let pageSize = 10;
    const searchName: string = (req.query.search_name as string) || "";

    const roomRepo = new RoomRepo();
    const { rooms, totalCount } = await roomRepo.getRooms(userId, page, pageSize, searchName);

    if ((page - 1) * pageSize + rooms.length >= totalCount) {
      pageSize = rooms.length;
    }

    response(res, { rooms, totalCount, page, pageSize });
  } catch (e) {
    defaultError(res, e);
  }
};

// 채팅방 조회
export const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomId = req.params.room_id;
    const roomRepo = new RoomRepo();
    const room = await roomRepo.getRoom(roomId);

    response(res, room);
  } catch (e) {
    defaultError(res, e);
  }
};

// 채팅방 개설
export const createRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomObj: object = req.body;
    const roomRepo = new RoomRepo();
    const createdRoom = await roomRepo.addRoom(roomObj);

    response(res, { room: createdRoom });
  } catch (e) {
    defaultError(res, e);
  }
};

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
export const getRoomParticipants = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const roomId = req.params.room_id;
    const roomRepo = new RoomRepo();
    const roomParticipants = await roomRepo.getRoomParticipants(roomId);

    response(res, roomParticipants);
  } catch (e) {
    defaultError(res, e);
  }
};
