import { Request, Response, NextFunction, RequestHandler } from "express";
import httpStatus from "http-status";

export function respond<T>(handler: (req: Request, res: Response, next: NextFunction) => Promise<T>): RequestHandler {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      return await handler(req, res, next);
    } catch (error) {
      return next(error);
    }
  };
}

export const success = (res: Response, statusCode: number, data: unknown): void => {
  if (data == null) {
    res.status(statusCode).json({ success: true, statusCode });
  } else {
    res.status(statusCode).json({ success: true, statusCode, data });
  }
};

export const defaultError = (res: Response, msg?: any, errorCode?: number) => {
  let result = { result: false };
  if (msg) {
    const data = { data: msg };
    result = Object.assign(result, data);
  }

  return res.status(errorCode === undefined ? 400 : errorCode).json(result);
};

export const response = (res: Response, data?: object, code: any = httpStatus.OK) => {
  let result = { result: true };

  if (typeof data === "object") {
    result = Object.assign(result, { data });
  }

  return res.status(code).json(result);
};

export const raiseError = (res: Response, statusCode: number, code: number, message: string): void => {
  res.status(statusCode).json({ success: false, statusCode, errors: { code, message } });
};
