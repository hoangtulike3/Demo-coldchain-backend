"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.modifyUser = exports.getUser = exports.addUser = exports.getMyAccountDetail = exports.updateMyAccountStatus = exports.updateMyAccountDetail = exports.generateWorkID = exports.getUsers = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const users_repository_1 = require("../repository/users.repository");
const error_1 = require("../utils/error");
const enum_1 = require("../utils/enum");
const response_1 = require("../utils/response");
const randomstring_1 = __importDefault(require("randomstring"));
const s3_1 = require("../utils/s3");
// 사용자 목록
const getUsers = async (req, res) => {
    try {
        // 관리자만 조회 가능
        if (req.user.role !== enum_1.UserRole.Admin) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
        }
        // 사용자 목록 조회
        const keyword = req.query.keyword;
        const userRepo = new users_repository_1.UserRepo();
        const users = await userRepo.findUsers(keyword);
        (0, response_1.response)(res, users);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getUsers = getUsers;
// GENERATE WORK ID
const generateWorkID = async (_, res) => {
    try {
        let random = randomstring_1.default.generate(15);
        const userRepo = new users_repository_1.UserRepo();
        const user = await userRepo.findUserByWorkID(random.toUpperCase());
        if (user) {
            random = randomstring_1.default.generate(15);
        }
        (0, response_1.response)(res, { work_id: random.toUpperCase() });
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.generateWorkID = generateWorkID;
// UPDATE CURRENT USER INFO
const updateMyAccountDetail = async (req, res) => {
    try {
        const user = req.user;
        const userRepo = new users_repository_1.UserRepo();
        let userObj = req.body;
        if (req.body.userObj) {
            userObj = JSON.parse(req.body.userObj);
        }
        else {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND));
        }
        const userInfo = await userRepo.getUserProfileById(user?.id);
        if (!userInfo) {
            throw (0, http_errors_1.default)(404, (0, error_1.getError)(error_1.Code.NOT_FOUND_USER));
        }
        let avatar_url = "";
        const files = req.files;
        if (files.photo) {
            const imageFile = files.photo[0];
            avatar_url = await (0, s3_1.uploadPackageFileToS3)(imageFile.buffer, imageFile.originalname, imageFile.mimetype);
        }
        const updateUser = await userRepo.modifyUser({
            display_name: userObj.display_name,
            description: userObj.description,
            name: userObj.name,
            // EDIT ON RIGHT CONDITION
            ...(avatar_url && { avatar_url }),
            ...(userInfo?.type === 1 && { phone: userObj.phone }),
            ...(userInfo?.type !== 1 && { email: userObj.email }),
        }, user.id);
        if (!updateUser) {
            throw (0, http_errors_1.default)(404, (0, error_1.getError)(error_1.Code.NOT_FOUND_USER));
        }
        (0, response_1.response)(res, updateUser);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.updateMyAccountDetail = updateMyAccountDetail;
// UPDATE CURRENT USER STATUS
const updateMyAccountStatus = async (req, res) => {
    try {
        const user = req.user;
        const userRepo = new users_repository_1.UserRepo();
        const userObj = req.body;
        const updateUser = await userRepo.modifyUser({ status: userObj.status }, user.id);
        if (!updateUser) {
            throw (0, http_errors_1.default)(404, (0, error_1.getError)(error_1.Code.NOT_FOUND_USER));
        }
        (0, response_1.response)(res, updateUser);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.updateMyAccountStatus = updateMyAccountStatus;
// GET CURRENT USER INFO
const getMyAccountDetail = async (req, res) => {
    try {
        const user = req.user;
        const userRepo = new users_repository_1.UserRepo();
        const userInfo = await userRepo.getUserProfileById(user?.id);
        if (!userInfo) {
            throw (0, http_errors_1.default)(404, (0, error_1.getError)(error_1.Code.NOT_FOUND_USER));
        }
        (0, response_1.response)(res, userInfo);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getMyAccountDetail = getMyAccountDetail;
// 사용자 등록
const addUser = async (req, res) => {
    // 관리자만 등록 가능
    if (req.user.role !== enum_1.UserRole.Admin) {
        throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
    }
    const userRepo = new users_repository_1.UserRepo();
    const userObj = req.body;
    try {
        // 사용자 정보 확인
        if (!req.body.email) {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND, "body.email"));
        }
        else if (!req.body.role) {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND, "body.role"));
        }
        else if (!(0, enum_1.isInstance)(req.body.role, enum_1.UserRole)) {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "body.role", Object.values(enum_1.UserRole).join(", ")));
        }
        // 이메일 중복 확인
        let user = await userRepo.getUserByEmail(req.body.email);
        if (user) {
            // 이메일 중복
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.DUPLICATE_EMAIL, req.body.email));
        }
        // 사용자 등록
        user = await userRepo.addUser(userObj);
        (0, response_1.response)(res, user);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.addUser = addUser;
// 사용자 조회
const getUser = async (req, res) => {
    try {
        // 관리자 혹은 본인만 조회 가능
        if (req.user.role !== enum_1.UserRole.Admin) {
            if (req.user.id !== req.params.userId) {
                throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
            }
        }
        // 사용자 조회
        const userId = req.params.userId;
        const userRepo = new users_repository_1.UserRepo();
        const user = await userRepo.getUserById(userId);
        if (!user) {
            // 미등록 사용자
            throw (0, http_errors_1.default)(404, (0, error_1.getError)(error_1.Code.NOT_FOUND_USER, userId));
        }
        (0, response_1.response)(res, user);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.getUser = getUser;
// 사용자 수정
const modifyUser = async (req, res) => {
    try {
        // 관리자만 수정 가능
        if (req.user.role !== enum_1.UserRole.Admin) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
        }
        // 사용자 정보 확인
        if (req.body.role && !(0, enum_1.isInstance)(req.body.role, enum_1.UserRole)) {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "body.role", Object.values(enum_1.UserRole)));
        }
        // 이메일 중복 확인
        const userId = req.params.userId;
        const userRepo = new users_repository_1.UserRepo();
        let user = await userRepo.getUserByEmail(req.body.email);
        if (user && user.id !== userId) {
            // 이메일 중복 (본인 제외)
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.DUPLICATE_EMAIL, req.body.email));
        }
        const userObj = req.body;
        // 사용자 수정
        user = await userRepo.modifyUser(userObj, userId);
        if (user === null) {
            // 미등록 사용자
            throw (0, http_errors_1.default)(404, (0, error_1.getError)(error_1.Code.NOT_FOUND_USER, userId));
        }
        (0, response_1.response)(res, user);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.modifyUser = modifyUser;
// 사용자 탈퇴
// export const deleteUser = async (req: Request, res: Response): Promise<void> => {
//   try {
//     // 관리자만 수정 가능
//     if ((req.user as User).role !== UserRole.Admin) {
//       throw createError(401, getError(Code.INVALID_CREDENTIAL));
//     } else if ((req.user as User).id === req.params.userId) {
//       // 본인 삭제 불가
//       throw createError(401, getError(Code.INVALID_CREDENTIAL));
//     }
//     const userId = req.params.userId;
//     await UserRepo.deleteUser(userId);
//     response(res);
//   } catch (e) {
//     defaultError(res, e);
//   }
// };
//# sourceMappingURL=users.controller.js.map