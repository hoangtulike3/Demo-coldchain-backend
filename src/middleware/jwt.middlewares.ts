import createError from "http-errors";
import { Request, Response, NextFunction } from "express";
import { UserRepo } from "../repository/users.repository";
import { Code, getError } from "../utils/error";
import JWToken from "../utils/jwt";

export default function (): (req: Request, res: Response, next: NextFunction) => void {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.headers.authorization) {
        throw createError(401, getError(Code.INVALID_CREDENTIAL));
      }
      // 헤더에서 액세스 토큰 정보 가져오기
      const token = req.headers.authorization.split(" ")[1];

      // 액세스 토큰 디코딩 및 유효성 확인
      const result = await JWToken.verify(token);
      if (!result.success) {
        if (result.error === JWToken.JWT_EXPIRED) {
          throw createError(401, getError(Code.ACCESS_TOKEN_EXPIRED));
        } else {
          throw createError(401, getError(Code.ACCESS_TOKEN_INVALID));
        }
      }

      // 액세스 토큰의 디코딩 정보에 포함된 사용자 정보를 이용하여 확인
      const decoded = result.payload;
      const userRepo = new UserRepo();
      const user = await userRepo.getUserById(decoded.id);
      if (!user) {
        // 미등록 사용자 ID
        throw createError(401, getError(Code.INVALID_CREDENTIAL));
      }

      // 로그인 성공
      req.user = {
        id: decoded.id,
        role: decoded.role,
      };
      next();
    } catch (error) {
      next(error);
    }
  };
}
