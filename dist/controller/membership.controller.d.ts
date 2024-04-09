import { Request, Response, NextFunction } from "express";
export declare const getMembershipByType: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPackage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createPackage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const modifyPackage: (req: Request, res: Response, next: NextFunction) => Promise<void>;
