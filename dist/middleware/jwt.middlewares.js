"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_errors_1 = __importDefault(require("http-errors"));
const users_repository_1 = require("../repository/users.repository");
const error_1 = require("../utils/error");
const jwt_1 = __importDefault(require("../utils/jwt"));
function default_1() {
    return async (req, _res, next) => {
        try {
            if (!req.headers.authorization) {
                throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
            }
            // 헤더에서 액세스 토큰 정보 가져오기
            const token = req.headers.authorization.split(" ")[1];
            // 액세스 토큰 디코딩 및 유효성 확인
            const result = await jwt_1.default.verify(token);
            if (!result.success) {
                if (result.error === jwt_1.default.JWT_EXPIRED) {
                    throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.ACCESS_TOKEN_EXPIRED));
                }
                else {
                    throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.ACCESS_TOKEN_INVALID));
                }
            }
            // 액세스 토큰의 디코딩 정보에 포함된 사용자 정보를 이용하여 확인
            const decoded = result.payload;
            const userRepo = new users_repository_1.UserRepo();
            const user = await userRepo.getUserById(decoded.id);
            if (!user) {
                // 미등록 사용자 ID
                throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
            }
            // 로그인 성공
            req.user = {
                id: decoded.id,
                role: decoded.role,
            };
            next();
        }
        catch (error) {
            next(error);
        }
    };
}
exports.default = default_1;
//# sourceMappingURL=jwt.middlewares.js.map