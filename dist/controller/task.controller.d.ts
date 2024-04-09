import { Request, Response, NextFunction } from "express";
export declare const getTasks: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const modifyTask: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getProcedureList: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRtpList: (req: Request, res: Response, next: NextFunction) => Promise<void>;
