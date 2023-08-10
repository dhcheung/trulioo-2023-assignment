import { RequestHandler, Request, Response, NextFunction } from "express";
import { validationResult } from 'express-validator';
import * as bcryptjs from 'bcryptjs';
import { IUser } from "../models/user";
import * as UserDb from "../data/userdb";
import * as SessionsDb from "../data/sessionsdb";

const saltRounds = process.env.BCRYPT_SALT_ROUNDS ?? 10;

export const signin: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: validationErrors.array()
        });
    }
    const { userId, password } = req.body;
    let existingUser: IUser | null;
    try {
        existingUser = await UserDb.findOne(userId);
    } catch {
        const error = new Error("Internal Server Error");
        return next(error);
    }
    if (!existingUser) {
        const error = Error("Invalid login.");
        return next(error);
    }

    const passwordMatch = await bcryptjs.compare(password, existingUser.password);
    if (!passwordMatch) {
        const error = Error("Invalid login.");
        return next(error);
    }
    let token;
    try {
        //Creating jwt token
        token = await SessionsDb.createUserSessionAndRetrieveToken(existingUser);
    } catch (err) {
        console.log(err);
        const error = new Error("Internal Server Error");
        return next(error);
    }

    res.status(200).json({
        success: true,
        data: {
            userId: existingUser.userId,
            role: existingUser.role,
            token: token,
        },
    });
};

export const signout: RequestHandler = async (
    req: Request,
    res: Response,
) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: validationErrors.array()
        });
    }
    const { userId, token } = req.body;

    const success = await SessionsDb.deleteSession(token, userId);
    if (success) {
        res.status(200).json({ success: true });
        return;
    }
    res.status(401).json({ success: false });
};

export const register: RequestHandler = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const validationErrors = validationResult(req)
    if (!validationErrors.isEmpty()) {
        res.status(400).json({
            success: false,
            errors: validationErrors.array()
        });
    }
    const { userId, role, password } = req.body;
    try {
        const existingUser = await UserDb.findOne(userId);
        if (existingUser) {
            const error = new Error("User already exists.");
            return next(error);
        }
    } catch {
        const error = new Error("Internal Server Error");
        return next(error);
    }

    const obfuscatedPassword = await bcryptjs.hash(password, saltRounds);
    const newUser: IUser = {
        userId: userId.toLocaleLowerCase(),
        role,
        password: obfuscatedPassword
    };

    try {
        await UserDb.save(newUser);
    } catch {
        const error = new Error("Internal Server Error");
        return next(error);
    }
    let token;
    try {
        token = await SessionsDb.createUserSessionAndRetrieveToken(newUser);
    } catch (err) {
        const error = new Error("Internal Server Error");
        return next(error);
    }
    res.status(200).json({
        success: true,
        data: {
            userId: newUser.userId,
            role: newUser.role,
            token: token,
        },
    });
};
