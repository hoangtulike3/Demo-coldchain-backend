import jwt from "jsonwebtoken";
import * as redisJwt from "../utils/redis";
import config from "../config";

export type IssuedToken = { token: string; payload: jwt.JwtPayload };
export type VerifyResult =
  | { success: true; payload: jwt.JwtPayload }
  | { success: false; error: string; payload?: jwt.JwtPayload };

export default class JWToken {
  static readonly JWT_EXPIRED = "jwt expired" as const;
  static readonly JWT_MALFORMED = "jwt malformed" as const;
  static secretKey = config.jwt.secretKey;
  static expiresIn = config.jwt.expiresIn;
  static refreshExpiresIn = config.jwt.refreshExpiresIn;

  static async sign(payload: Record<string, unknown>): Promise<IssuedToken> {
    const token = jwt.sign(payload, this.secretKey, {
      algorithm: "HS256",
      expiresIn: this.expiresIn,
    });
    const decoded = jwt.decode(token);
    if (decoded === null || typeof decoded === "string") {
      throw new Error(decoded || "Failed to issus token");
    }
    return { token, payload: decoded };
  }

  static async verify(token: string): Promise<VerifyResult> {
    return new Promise((resolve) => {
      jwt.verify(token, this.secretKey, (error, decoded) => {
        if (!decoded) {
          decoded = jwt.decode(token) || undefined;
        }
        if (!decoded || typeof decoded === "string") {
          resolve({ success: false, error: this.JWT_MALFORMED });
        } else if (error) {
          resolve({ success: false, error: error.message, payload: decoded });
        } else {
          resolve({ success: true, payload: decoded });
        }
      });
    });
  }

  static async refresh(key: string): Promise<IssuedToken> {
    const token = jwt.sign({}, this.secretKey, {
      algorithm: "HS256",
      expiresIn: this.refreshExpiresIn,
    });
    const decoded = jwt.decode(token);
    if (decoded === null || typeof decoded === "string") {
      throw new Error(decoded || "Failed to issus token");
    }
    await redisJwt.setValue(key, token);
    return { token, payload: decoded };
  }

  static async refreshVerify(key: string, token: string): Promise<VerifyResult> {
    const data = await redisJwt.getValue(key);
    if (token !== data) {
      return { success: false, error: "access token not found" };
    }
    return this.verify(token);
  }
}
