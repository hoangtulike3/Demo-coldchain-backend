import { Request, Response } from "express";
export declare const login: (req: Request, res: Response) => Promise<void>;
export declare const refreshToken: (req: Request, res: Response) => Promise<void>;
export declare const googleLogin: (req: Request, res: Response) => Promise<void>;
export declare const googleSignup: (req: Request, res: Response) => Promise<void>;
