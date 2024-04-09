import { Request, Response, NextFunction } from "express";
export declare const getRooms: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRoom: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createRoom: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getRoomParticipants: (req: Request, res: Response, next: NextFunction) => Promise<void>;
