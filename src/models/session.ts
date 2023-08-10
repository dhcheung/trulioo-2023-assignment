import mongoose, { Schema } from 'mongoose';

 export interface ISession {
    readonly token: string;
    readonly expirationEpoch: number;
}

const sessionSchema: Schema<ISession> = new Schema<ISession>({
    token: {type: String, required: true},
    expirationEpoch: {type: Number, required: true},
})

export const SessionModel = mongoose.model("Session", sessionSchema);