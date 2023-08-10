import { UserModel } from '../../src/models/user';
import { findOne, save } from '../../src/data/userdb';

const mockingoose = require("mockingoose");

describe("userdb tests", () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    describe("save tests", () => {
        test("save fails", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            mockingoose(UserModel).toReturn(new Error("DB Error"), "save");

            await expect(save(testUser)).rejects.toThrowError("DB Error");
        });

        test("save succeeds", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            mockingoose(UserModel).toReturn(testUser, "save");

            const saveResult = await save(testUser)
            expect(saveResult.userId).toBe(testUser.userId);
            expect(saveResult.password).toBe(testUser.password);
            expect(saveResult.role).toBe(testUser.role);
        });
    });

    describe("findOne tests", () => {
        test("findOne succeeds", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            mockingoose(UserModel).toReturn(testUser, "findOne");

            const findOneResult = await findOne(testUser.userId)
            expect(findOneResult?.userId).toBe(testUser.userId);
            expect(findOneResult?.password).toBe(testUser.password);
            expect(findOneResult?.role).toBe(testUser.role);
        });

        test("findOne finds nothing", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            mockingoose(UserModel).toReturn(null, "findOne");

            const findOneResult = await findOne(testUser.userId)
            expect(findOneResult).toBeNull();
        });

        test("findOne fails", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            mockingoose(UserModel).toReturn(new Error("DB Error"), "findOne");

            await expect(findOne(testUser.userId)).rejects.toThrowError("DB Error");
        });
    });
});