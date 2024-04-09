import { Request, Response, NextFunction } from "express";
export declare const getPlaces: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPlace: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createPlace: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const modifyPlace: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPlaceType: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPlaceCategory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getService: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const patchToggle: (req: Request, res: Response, next: NextFunction) => Promise<void>;
