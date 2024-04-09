import { NextFunction, Request, Response } from "express";
export declare const setIO: (socketIO: any) => void;
export declare const getIO: () => any;
export declare const createMessage: (req: Request, res: Response) => Promise<void>;
export declare const getMessages: (req: Request, res: Response) => Promise<void>;
export declare const markMessageAsRead: (req: Request, res: Response, io: any) => Promise<void>;
export declare const getDefinedMessages: (req: Request, res: Response, next: NextFunction) => Promise<void>;
