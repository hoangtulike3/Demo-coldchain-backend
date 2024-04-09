import { Request, Response, NextFunction, RequestHandler } from "express";
export declare function respond<T>(handler: (req: Request, res: Response, next: NextFunction) => Promise<T>): RequestHandler;
export declare const success: (res: Response, statusCode: number, data: unknown) => void;
export declare const defaultError: (res: Response, msg?: any, errorCode?: number) => Response<any, Record<string, any>>;
export declare const response: (res: Response, data?: object, code?: any) => Response<any, Record<string, any>>;
export declare const raiseError: (res: Response, statusCode: number, code: number, message: string) => void;
