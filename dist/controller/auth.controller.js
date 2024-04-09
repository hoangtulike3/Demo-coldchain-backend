"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.googleSignup = exports.googleLogin = exports.refreshToken = exports.login = void 0;
const http_errors_1 = __importDefault(require("http-errors"));
const users_repository_1 = require("../repository/users.repository");
const error_1 = require("../utils/error");
const response_1 = require("../utils/response");
const jwt_1 = __importDefault(require("../utils/jwt"));
const index_1 = __importDefault(require("../config/index"));
const axios_1 = __importDefault(require("axios"));
const google_auth_1 = __importStar(require("../utils/google-auth"));
// 액세스 토큰 발급
const login = async (req, res) => {
    try {
        // 로그인 정보 확인
        if (!req.body.email) {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND, "body.email"));
        }
        // 사용자, 비밀번호 매칭 확인 (로그인)
        const email = req.body.email;
        const userRepo = new users_repository_1.UserRepo();
        // const password = req.body.password;
        const user = await userRepo.authenticate(email);
        if (!user) {
            // 로그인 실패
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
        }
        // 로그인 성공
        const payload = { id: user.id, role: user.role };
        // 액세스 토큰 발급
        const accessToken = await jwt_1.default.sign(payload);
        // 재발급 토큰 발급
        const refreshToken = await jwt_1.default.refresh(user.id);
        const userInfo = await userRepo.getUserById(user.id);
        const token = {
            access_token: accessToken.token,
            refresh_token: refreshToken.token,
            expiration: accessToken.payload.exp,
            refresh_expiration: refreshToken.payload.exp,
            user_info: userInfo,
        };
        (0, response_1.response)(res, token);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.login = login;
// 액세스 토큰 재발급
const refreshToken = async (req, res) => {
    try {
        // 기존 토큰 정보 확인
        if (!req.body.access_token) {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND, "body.access_token"));
        }
        else if (!req.body.refresh_token) {
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.PARAMETER_NOT_FOUND, "body.refresh_token"));
        }
        // 액세스 토큰 확인
        const accessToken = req.body.access_token;
        const verify = await jwt_1.default.verify(accessToken);
        if (verify.success) {
            // 만료되지 않은 액세스 토큰
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.ACCESS_TOKEN_NOT_EXPIRED));
        }
        else if (verify.error === jwt_1.default.JWT_MALFORMED || !verify.payload) {
            // 유효하지 않은 액세스 토큰
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.ACCESS_TOKEN_INVALID));
        }
        else if (verify.error !== jwt_1.default.JWT_EXPIRED) {
            // 기타 오류
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.ACCESS_TOKEN_INVALID));
        }
        // 재발급 토큰 확인
        const userId = verify.payload.id;
        const refreshToken = req.body.refresh_token;
        const userRepo = new users_repository_1.UserRepo();
        const verify2 = await jwt_1.default.refreshVerify(userId, refreshToken);
        if (!verify2.success && verify2.error === jwt_1.default.JWT_EXPIRED) {
            // 재발급 토큰 만료됨
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.REFRESH_TOKEN_EXPIRED));
        }
        else if (!verify2.success) {
            // 기타 오류
            throw (0, http_errors_1.default)(400, (0, error_1.getError)(error_1.Code.REFRESH_TOKEN_INVALID));
        }
        // 토큰 내 사용자 ID로 사용자 조회
        const user = await userRepo.getUserById(userId);
        if (!user) {
            // 미등록 사용자
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.INVALID_CREDENTIAL));
        }
        // 새 액세스 토큰 발급
        const payload = { id: user.id, role: user.role };
        const newAccessToken = await jwt_1.default.sign(payload);
        const token = {
            access_token: newAccessToken.token,
            refresh_token: refreshToken,
            expiration: newAccessToken.payload.exp,
            refresh_expiration: verify2.payload.exp,
        };
        (0, response_1.response)(res, token);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.refreshToken = refreshToken;
// 엑세스토큰 재발급
async function exchangeRefreshToken(refreshToken, clientType) {
    try {
        let clientCredentials = {};
        const createRefreshToken = await axios_1.default.post("https://oauth2.googleapis.com/token", {
            refresh_token: refreshToken,
            grant_type: "refresh_token",
        });
        switch (clientType) {
            case "web":
                clientCredentials = {
                    client_id: index_1.default.google.clientIdWeb,
                    client_secret: index_1.default.google.clientSecret,
                };
                break;
            case "ios":
                clientCredentials.client_id = index_1.default.google.clientIdIos;
                break;
            case "android":
                clientCredentials.client_id = index_1.default.google.clientIdAndroid;
                break;
            default:
                throw new Error("Invalid client type");
        }
        const data = createRefreshToken.data;
        if (data.access_token) {
            console.log(data);
            return data;
        }
        else {
            console.log("Failed to exchange Refresh Token:", data.error);
            return null;
        }
    }
    catch (e) {
        console.error("Error exchanging Refresh Token:", e.response.data.error_description);
        return null;
    }
}
// 구글 아이디로 로그인
const googleLogin = async (req, res) => {
    try {
        const serverAuthCode = req.body.server_auth_code;
        let googleInfo = {};
        const userRepo = new users_repository_1.UserRepo();
        try {
            const oauthToken = await google_auth_1.default.getToken({ code: serverAuthCode });
            const tokens = oauthToken.tokens;
            const idToken = tokens.id_token;
            if (idToken) {
                // if is valid
                const payload = await (0, google_auth_1.verifyIDToken)(idToken);
                googleInfo = {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    email: payload?.email,
                    name: payload?.name,
                    avatar_url: payload?.picture,
                    access_token_expire: tokens.expiry_date,
                };
            }
            else {
                throw (0, http_errors_1.default)(500, (0, error_1.getError)(error_1.Code.UNKNOWN_ERROR));
            }
        }
        catch (error) {
            throw (0, http_errors_1.default)(500, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "body.server_auth_code"));
        }
        if (!googleInfo?.email || !googleInfo?.access_token) {
            throw (0, http_errors_1.default)(500, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "body.server_auth_code"));
        }
        const user = await userRepo.findUserByEmail(googleInfo.email);
        if (!user) {
            throw (0, http_errors_1.default)(404, (0, error_1.getError)(error_1.Code.NOT_FOUND_USER));
        }
        const accessToken = await jwt_1.default.sign({ id: user.id, role: user.role });
        // 재발급 토큰 발급
        const refreshToken = await jwt_1.default.refresh(user.id);
        const userInfo = await userRepo.getUserById(user.id);
        const token = {
            access_token: accessToken.token,
            refresh_token: refreshToken.token,
            expiration: accessToken.payload.exp,
            refresh_expiration: refreshToken.payload.exp,
            user_info: userInfo,
        };
        (0, response_1.response)(res, token);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.googleLogin = googleLogin;
// 구글 아이디로 회원가입
const googleSignup = async (req, res) => {
    try {
        const serverAuthCode = req.body.server_auth_code;
        let googleInfo = {};
        const userRepo = new users_repository_1.UserRepo();
        try {
            const oauthToken = await google_auth_1.default.getToken({ code: serverAuthCode });
            const tokens = oauthToken.tokens;
            const idToken = tokens.id_token;
            if (idToken) {
                // if is valid
                const payload = await (0, google_auth_1.verifyIDToken)(idToken);
                googleInfo = {
                    access_token: tokens.access_token,
                    refresh_token: tokens.refresh_token,
                    email: payload?.email,
                    name: payload?.name,
                    avatar_url: payload?.picture,
                    access_token_expire: tokens.expiry_date,
                };
            }
            else {
                throw (0, http_errors_1.default)(500, (0, error_1.getError)(error_1.Code.UNKNOWN_ERROR));
            }
        }
        catch (error) {
            throw (0, http_errors_1.default)(500, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "body.server_auth_code"));
        }
        if (!googleInfo?.email || !googleInfo?.access_token) {
            throw (0, http_errors_1.default)(500, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "body.server_auth_code"));
        }
        const user = await userRepo.findUserByEmail(googleInfo.email);
        if (user) {
            throw (0, http_errors_1.default)(401, (0, error_1.getError)(error_1.Code.PARAMETER_INVALID, "email"));
        }
        const addUser = await userRepo.addUser({
            email: googleInfo.email,
            name: googleInfo.name,
            avatar_url: googleInfo.avatar_url,
        });
        const accessToken = await jwt_1.default.sign({ id: addUser.id, role: addUser.role });
        // 재발급 토큰 발급
        const refreshToken = await jwt_1.default.refresh(addUser.id);
        const userInfo = await userRepo.getUserById(addUser.id);
        const token = {
            access_token: accessToken.token,
            refresh_token: refreshToken.token,
            expiration: accessToken.payload.exp,
            refresh_expiration: refreshToken.payload.exp,
            user_info: userInfo,
        };
        (0, response_1.response)(res, token);
    }
    catch (e) {
        (0, response_1.defaultError)(res, e);
    }
};
exports.googleSignup = googleSignup;
//# sourceMappingURL=auth.controller.js.map