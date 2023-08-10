import { IUser, UserModel } from "../models/user";
import mongoose from 'mongoose';

const mongoConnectionString = process.env.MONGO_URI!;
mongoose.connect(mongoConnectionString);

export const save = async (newUser: IUser): Promise<IUser> => {
    return await (new UserModel(newUser).save());
}

export const findOne = async (userId: String): Promise<IUser | null> => {
    return (await UserModel.findOne(
        {
            userId: userId.toLocaleLowerCase()
        }
    ).exec());
}