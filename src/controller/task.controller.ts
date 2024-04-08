import { Request, Response, NextFunction } from "express";
import { defaultError, response } from "../utils/response";
import { TaskRepo } from "../repository/task.repository";
import { User } from "../interface/User";
import { RoomRepo } from "../repository/room.repository";

// 전체 task 조회
export const getTasks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = (req.user as User).id;
    const page: number = parseInt(req.query.page as string) || 1;
    let pageSize = 10;
    const searchName: string = (req.query.search_name as string) || "";

    const taskRepo = new TaskRepo();
    const { tasks, totalCount } = await taskRepo.getTasks(userId, page, pageSize, searchName);

    if ((page - 1) * pageSize + tasks.length >= totalCount) {
      pageSize = tasks.length;
    }

    response(res, { tasks, totalCount, page, pageSize });
  } catch (e) {
    defaultError(res, e);
  }
};

// task 조회
export const getTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId: string = req.params.task_id;
    const taskRepo = new TaskRepo();
    const task = await taskRepo.getTask(taskId);

    response(res, task);
  } catch (e) {
    defaultError(res, e);
  }
};

// task 추가
export const createTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId: string = (req.user as User).id;
    const taskObj: any = req.body;
    const taskRepo = new TaskRepo();
    const roomRepo = new RoomRepo();
    const task = await taskRepo.addTask(taskObj, userId);

    if (taskObj.room_id && task.id) {
      await roomRepo.modifyRoom(taskObj, taskObj.room_id, task.id);
    }

    response(res, task);
  } catch (e) {
    defaultError(res, e);
  }
};

// task 수정
export const modifyTask = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskId = req.params.task_id;
    const taskObj: object = req.body;
    const taskRepo = new TaskRepo();
    const task: any = await taskRepo.modifyTask(taskObj, taskId);

    response(res, task);
  } catch (e) {
    defaultError(res, e);
  }
};

// procedure 목록 조회
export const getProcedureList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskRepo = new TaskRepo();
    const procedureList: any = await taskRepo.getProcedure();

    response(res, procedureList);
  } catch (e) {
    defaultError(res, e);
  }
};

// rtp 목록 조회
export const getRtpList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const taskRepo = new TaskRepo();
    const rtpList: any = await taskRepo.getRtp();

    response(res, rtpList);
  } catch (e) {
    defaultError(res, e);
  }
};
