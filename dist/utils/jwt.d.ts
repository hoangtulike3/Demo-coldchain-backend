import jwt from "jsonwebtoken";
export type IssuedToken = {
    token: string;
    payload: jwt.JwtPayload;
};
export type VerifyResult = {
    success: true;
    payload: jwt.JwtPayload;
} | {
    success: false;
    error: string;
    payload?: jwt.JwtPayload;
};
export default class JWToken {
    static readonly JWT_EXPIRED: "jwt expired";
    static readonly JWT_MALFORMED: "jwt malformed";
    static secretKey: string;
    static expiresIn: string;
    static refreshExpiresIn: string;
    static sign(payload: Record<string, unknown>): Promise<IssuedToken>;
    static verify(token: string): Promise<VerifyResult>;
    static refresh(key: string): Promise<IssuedToken>;
    static refreshVerify(key: string, token: string): Promise<VerifyResult>;
}
