import createError from "http-errors";
import { Request, Response } from "express";
import { UserRepo } from "../repository/users.repository";
import { getError, Code } from "../utils/error";
import { defaultError, response } from "../utils/response";
import JWToken from "../utils/jwt";
import { OAuth2Client } from "google-auth-library";
import { UserRole } from "../utils/enum";
import config from "../config/index";
import axios from "axios";
import GoogleOAuth2, { verifyIDToken } from "../utils/google-auth";

// 액세스 토큰 발급
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // 로그인 정보 확인
    if (!req.body.email) {
      throw createError(400, getError(Code.PARAMETER_NOT_FOUND, "body.email"));
    }
    // 사용자, 비밀번호 매칭 확인 (로그인)
    const email = req.body.email;
    const userRepo = new UserRepo();

    // const password = req.body.password;
    const user = await userRepo.authenticate(email);
    if (!user) {
      // 로그인 실패
      throw createError(401, getError(Code.INVALID_CREDENTIAL));
    }
    // 로그인 성공
    const payload = { id: user.id, role: user.role };
    // 액세스 토큰 발급
    const accessToken = await JWToken.sign(payload);
    // 재발급 토큰 발급
    const refreshToken = await JWToken.refresh(user.id);
    const userInfo = await userRepo.getUserById(user.id);
    const token = {
      access_token: accessToken.token,
      refresh_token: refreshToken.token,
      expiration: accessToken.payload.exp,
      refresh_expiration: refreshToken.payload.exp,
      user_info: userInfo,
    };

    response(res, token);
  } catch (e) {
    defaultError(res, e);
  }
};

// 액세스 토큰 재발급
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    // 기존 토큰 정보 확인
    if (!req.body.access_token) {
      throw createError(400, getError(Code.PARAMETER_NOT_FOUND, "body.access_token"));
    } else if (!req.body.refresh_token) {
      throw createError(400, getError(Code.PARAMETER_NOT_FOUND, "body.refresh_token"));
    }
    // 액세스 토큰 확인
    const accessToken = req.body.access_token;
    const verify = await JWToken.verify(accessToken);
    if (verify.success) {
      // 만료되지 않은 액세스 토큰
      throw createError(400, getError(Code.ACCESS_TOKEN_NOT_EXPIRED));
    } else if (verify.error === JWToken.JWT_MALFORMED || !verify.payload) {
      // 유효하지 않은 액세스 토큰
      throw createError(400, getError(Code.ACCESS_TOKEN_INVALID));
    } else if (verify.error !== JWToken.JWT_EXPIRED) {
      // 기타 오류
      throw createError(400, getError(Code.ACCESS_TOKEN_INVALID));
    }
    // 재발급 토큰 확인
    const userId = verify.payload.id;
    const refreshToken = req.body.refresh_token;
    const userRepo = new UserRepo();

    const verify2 = await JWToken.refreshVerify(userId, refreshToken);
    if (!verify2.success && verify2.error === JWToken.JWT_EXPIRED) {
      // 재발급 토큰 만료됨
      throw createError(400, getError(Code.REFRESH_TOKEN_EXPIRED));
    } else if (!verify2.success) {
      // 기타 오류
      throw createError(400, getError(Code.REFRESH_TOKEN_INVALID));
    }
    // 토큰 내 사용자 ID로 사용자 조회
    const user = await userRepo.getUserById(userId);
    if (!user) {
      // 미등록 사용자
      throw createError(401, getError(Code.INVALID_CREDENTIAL));
    }
    // 새 액세스 토큰 발급
    const payload = { id: user.id, role: user.role };
    const newAccessToken = await JWToken.sign(payload);
    const token = {
      access_token: newAccessToken.token,
      refresh_token: refreshToken,
      expiration: newAccessToken.payload.exp,
      refresh_expiration: verify2.payload.exp,
    };
    response(res, token);
  } catch (e) {
    defaultError(res, e);
  }
};

// 엑세스토큰 재발급
async function exchangeRefreshToken(refreshToken: any, clientType: string) {
  try {
    let clientCredentials: any = {};

    const createRefreshToken = await axios.post("https://oauth2.googleapis.com/token", {
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    });

    switch (clientType) {
      case "web":
        clientCredentials = {
          client_id: config.google.clientIdWeb,
          client_secret: config.google.clientSecret,
        };
        break;
      case "ios":
        clientCredentials.client_id = config.google.clientIdIos;
        break;
      case "android":
        clientCredentials.client_id = config.google.clientIdAndroid;
        break;
      default:
        throw new Error("Invalid client type");
    }
    const data = createRefreshToken.data;
    if (data.access_token) {
      console.log(data);
      return data;
    } else {
      console.log("Failed to exchange Refresh Token:", data.error);
      return null;
    }
  } catch (e: any) {
    console.error("Error exchanging Refresh Token:", e.response.data.error_description);
    return null;
  }
}

// 구글 아이디로 로그인
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const serverAuthCode = req.body.server_auth_code;
    let googleInfo: {
      access_token?: string | null;
      refresh_token?: string | null;
      email?: string;
      name?: string;
      avatar_url?: string;
      access_token_expire?: number | null;
    } = {};
    const userRepo = new UserRepo();
    try {
      const oauthToken = await GoogleOAuth2.getToken({ code: serverAuthCode });
      const tokens = oauthToken.tokens;
      const idToken = tokens.id_token;
      if (idToken) {
        // if is valid
        const payload = await verifyIDToken(idToken);
        googleInfo = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          email: payload?.email,
          name: payload?.name,
          avatar_url: payload?.picture,
          access_token_expire: tokens.expiry_date,
        };
      } else {
        throw createError(500, getError(Code.UNKNOWN_ERROR));
      }
    } catch (error) {
      throw createError(500, getError(Code.PARAMETER_INVALID, "body.server_auth_code"));
    }

    if (!googleInfo?.email || !googleInfo?.access_token) {
      throw createError(500, getError(Code.PARAMETER_INVALID, "body.server_auth_code"));
    }

    const user = await userRepo.findUserByEmail(googleInfo.email);
    if (!user) {
      throw createError(404, getError(Code.NOT_FOUND_USER));
    }

    const accessToken = await JWToken.sign({ id: user.id, role: user.role });
    // 재발급 토큰 발급
    const refreshToken = await JWToken.refresh(user.id);
    const userInfo = await userRepo.getUserById(user.id);
    const token = {
      access_token: accessToken.token,
      refresh_token: refreshToken.token,
      expiration: accessToken.payload.exp,
      refresh_expiration: refreshToken.payload.exp,
      user_info: userInfo,
    };

    response(res, token);
  } catch (e: any) {
    defaultError(res, e);
  }
};

// 구글 아이디로 회원가입
export const googleSignup = async (req: Request, res: Response): Promise<void> => {
  try {
    const serverAuthCode = req.body.server_auth_code;
    let googleInfo: {
      access_token?: string | null;
      refresh_token?: string | null;
      email?: string;
      name?: string;
      avatar_url?: string;
      access_token_expire?: number | null;
    } = {};
    const userRepo = new UserRepo();
    try {
      const oauthToken = await GoogleOAuth2.getToken({ code: serverAuthCode });
      const tokens = oauthToken.tokens;
      const idToken = tokens.id_token;
      if (idToken) {
        // if is valid
        const payload = await verifyIDToken(idToken);
        googleInfo = {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          email: payload?.email,
          name: payload?.name,
          avatar_url: payload?.picture,
          access_token_expire: tokens.expiry_date,
        };
      } else {
        throw createError(500, getError(Code.UNKNOWN_ERROR));
      }
    } catch (error) {
      throw createError(500, getError(Code.PARAMETER_INVALID, "body.server_auth_code"));
    }

    if (!googleInfo?.email || !googleInfo?.access_token) {
      throw createError(500, getError(Code.PARAMETER_INVALID, "body.server_auth_code"));
    }

    const user = await userRepo.findUserByEmail(googleInfo.email);
    if (user) {
      throw createError(401, getError(Code.PARAMETER_INVALID, "email"));
    }

    const addUser = await userRepo.addUser({
      email: googleInfo.email,
      name: googleInfo.name,
      avatar_url: googleInfo.avatar_url,
    });

    const accessToken = await JWToken.sign({ id: addUser.id, role: addUser.role });
    // 재발급 토큰 발급
    const refreshToken = await JWToken.refresh(addUser.id);
    const userInfo = await userRepo.getUserById(addUser.id);
    const token = {
      access_token: accessToken.token,
      refresh_token: refreshToken.token,
      expiration: accessToken.payload.exp,
      refresh_expiration: refreshToken.payload.exp,
      user_info: userInfo,
    };

    response(res, token);
  } catch (e) {
    defaultError(res, e);
  }
};
