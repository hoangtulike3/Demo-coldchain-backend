import util from "util";

export enum Code {
  PARAMETER_NOT_FOUND = 1000,
  PARAMETER_INVALID = 1001,
  CLIENT_TYPE_INVALID = 1002,
  PLACE_NAME_DUPLICATED = 1003,
  ACCESS_TOKEN_EXPIRED = 1100,
  ACCESS_TOKEN_NOT_EXPIRED = 1101,
  ACCESS_TOKEN_INVALID = 1102,
  REFRESH_TOKEN_EXPIRED = 1103,
  REFRESH_TOKEN_INVALID = 1104,
  INVALID_CREDENTIAL = 1200,
  NOT_FOUND_USER = 1300,
  DUPLICATE_EMAIL = 1301,
  UN_AUTHORIZE = 1401,
  FORBIDDEN = 1403,
  NOT_FOUND = 1302,
  UNKNOWN_ERROR = 9999,
}
export const errorMessage: { [key in Code]: string } = {
  [Code.PARAMETER_NOT_FOUND]: "Parameter Not Found: %s",
  [Code.PARAMETER_INVALID]: "Parameter Invalid: %s (supported: %s)",
  [Code.CLIENT_TYPE_INVALID]: "Client Type Invalid: %s",
  [Code.PLACE_NAME_DUPLICATED]: "Place Name Duplicated.",
  [Code.ACCESS_TOKEN_EXPIRED]: "Access token is expired",
  [Code.ACCESS_TOKEN_NOT_EXPIRED]: "Access token is not expired.",
  [Code.ACCESS_TOKEN_INVALID]: "Invalid Access Token",
  [Code.REFRESH_TOKEN_EXPIRED]: "Refresh token is expired",
  [Code.REFRESH_TOKEN_INVALID]: "Invalid Refresh Token",
  [Code.INVALID_CREDENTIAL]: "Invalid Credential",
  [Code.NOT_FOUND_USER]: "Not Found User: %s",
  [Code.DUPLICATE_EMAIL]: "Duplicate Email: %s",
  [Code.NOT_FOUND]: "Not Found: %s",
  [Code.UNKNOWN_ERROR]: "Unknown Error",
  [Code.UN_AUTHORIZE]: "Unauthorized",
  [Code.FORBIDDEN]: "FORBIDDEN",
};

export class ErrorEx extends Error {
  constructor(readonly code: Code, readonly message: string) {
    super();
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
  }
}

export function getError(code: Code, ...args: unknown[]): ErrorEx {
  const message = util.format(errorMessage[code], ...args);
  return new ErrorEx(code, message);
}
