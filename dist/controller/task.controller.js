"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRtpList = exports.getProcedureList = exports.modifyTask = exports.createTask = exports.getTask = exports.getTasks = void 0;
const response_1 = require("../utils/response");
const task_repository_1 = require("../repository/task.repository");
const room_repository_1 = require("../repository/room.repository");
// 전체 task 조회
const getTasks = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        let pageSize = 10;
        const searchName = req.query.search_name || "";
        const taskRepo = new task_repository_1.TaskRepo();
        const { tasks, totalCount } = await taskRepo.getTasks(userId, page, pageSize, searchName);
        if ((page - 1) * pageSize + tasks.length >= totalCount) {
            pageSize = tasks.length;
        }
        (0, response_1.response)(res, { tasks, totalCount, page, pageSize });
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getTasks = getTasks;
// task 조회
const getTask = async (req, res, next) => {
    try {
        const taskId = req.params.task_id;
        const taskRepo = new task_repository_1.TaskRepo();
        const task = await taskRepo.getTask(taskId);
        (0, response_1.response)(res, task);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getTask = getTask;
// task 추가
const createTask = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const taskObj = req.body;
        const taskRepo = new task_repository_1.TaskRepo();
        const roomRepo = new room_repository_1.RoomRepo();
        const task = await taskRepo.addTask(taskObj, userId);
        if (taskObj.room_id && task.id) {
            await roomRepo.modifyRoom(taskObj, taskObj.room_id, task.id);
        }
        (0, response_1.response)(res, task);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.createTask = createTask;
// task 수정
const modifyTask = async (req, res, next) => {
    try {
        const taskId = req.params.task_id;
        const taskObj = req.body;
        const taskRepo = new task_repository_1.TaskRepo();
        const task = await taskRepo.modifyTask(taskObj, taskId);
        (0, response_1.response)(res, task);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.modifyTask = modifyTask;
// procedure 목록 조회
const getProcedureList = async (req, res, next) => {
    try {
        const taskRepo = new task_repository_1.TaskRepo();
        const procedureList = await taskRepo.getProcedure();
        (0, response_1.response)(res, procedureList);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getProcedureList = getProcedureList;
// rtp 목록 조회
const getRtpList = async (req, res, next) => {
    try {
        const taskRepo = new task_repository_1.TaskRepo();
        const rtpList = await taskRepo.getRtp();
        (0, response_1.response)(res, rtpList);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getRtpList = getRtpList;
//# sourceMappingURL=task.controller.js.map