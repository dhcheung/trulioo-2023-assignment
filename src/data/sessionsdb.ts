import { Agenda, Job } from "agenda";
import jwt from "jsonwebtoken";
import { SessionModel } from "../models/session";
import { IUser } from "../models/user";
import mongoose from 'mongoose';

const jwtSecret = process.env.JWT_SECRET!;
const mongoConnectionString = process.env.MONGO_URI!
mongoose.connect(mongoConnectionString);

declare module 'jsonwebtoken' {
    export interface UserJwtPayload extends jwt.JwtPayload {
        userId: string,
        role: string,
    }
}

function getEpochNow(): number {
    return Date.now();
}

function getExpirationEpoch(expirationInMinutes: number) {
    return getEpochNow() + expirationInMinutes * 60 * 1000;
}

export async function cleanupInactiveSessions() {
    await SessionModel.where("expirationEpoch")
        .lt(getEpochNow())
        .deleteMany()
        .exec();
}

export function signJWT(user: IUser, newExpiration: number) {
    return jwt.sign(
        { userId: user.userId, role: user.role },
        jwtSecret,
        { expiresIn: newExpiration }
    );
}

export async function createUserSessionAndRetrieveToken(
    user: IUser,
    expirationInMinutes: number = 60
) {
    const newExpiration = getExpirationEpoch(expirationInMinutes);
    const newToken = signJWT(user, newExpiration);

    await new SessionModel({
        token: newToken,
        expirationEpoch: newExpiration,
    }).save();
    return newToken;
}

export async function checkIfSessionActive(token: string, userId: string): Promise<boolean> {
    const sessionExists = await SessionModel.exists({
        token: token
    }).exec();
    if (!sessionExists?._id) {
        return false;
    }
    try {
        const decoded = jwt.verify(token, jwtSecret) as jwt.JwtPayload;
        return decoded.userId === userId;
    } catch {
        console.log("Failed to decode token");
        return false;
    }

}

export async function deleteSession(token: string, userId: string): Promise<boolean> {
    const isValid = await checkIfSessionActive(token, userId);
    if (isValid) {
        const deleteResult = await SessionModel.deleteOne({
            token: token
        }).exec();
        return deleteResult.deletedCount > 0;
    }
    return false;
}

(async function () {
    const agenda = new Agenda({
        db: {
            address: mongoConnectionString,
        },
    });
    // Define tasks
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    agenda.define("clean inactive sessions", async (job: Job) => {
        console.log("[Server] Cleaning inactive sessions");
        await cleanupInactiveSessions();
    });
    // Schedule tasks
    await agenda.start();
    agenda.every("1 hour", "clean inactive sessions");
    console.log("[Server] Started Inactive Cleanup job");
})();
