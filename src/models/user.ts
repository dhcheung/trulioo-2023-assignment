import mongoose, { Schema } from "mongoose";

export interface IUser {
    readonly userId: string;
    readonly password: string;
    readonly role: string;
}

const userSchema: Schema<IUser> = new Schema<IUser>({
    userId: { type: String, required: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
});

export const UserModel = mongoose.model("User", userSchema);