import * as bcryptjs from "bcryptjs";
import { getMockReq, getMockRes } from "@jest-mock/express";
import {
    signin,
    signout,
    register,
} from "../../src/controllers/login-controller";
import { UserModel } from "../../src/models/user";
import { SessionModel } from "../../src/models/session";
import { signJWT } from "../../src/data/sessionsdb";

const mockingoose = require("mockingoose");

// Note* - There are some cases here missing due to time constraints, but I would ideally test all the DB errors being thrown as well
// Also, need to verify the error messages as well

describe("login-controller tests", () => {
    beforeEach(() => {
        mockingoose.resetAll();
    });

    describe("signin tests", () => {
        test("signin success", async () => {
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    password: "password",
                },
            });
            const { res, next, clearMockRes } = getMockRes();
            const obfuscatedPassword = await bcryptjs.hash(
                req.body.password,
                10
            );
            var testExistingUser = {
                userId: "testuser",
                password: obfuscatedPassword,
                role: "testrole",
            };
            mockingoose(UserModel).toReturn(testExistingUser, "findOne");

            await signin(req, res, next);

            expect(res.status).toBeCalledWith(200);
            expect(res.json).toBeCalledWith({
                success: true,
                data: {
                    userId: testExistingUser.userId,
                    role: testExistingUser.role,
                    token: expect.any(String),
                },
            });
        });

        test("signin no user", async () => {
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    password: "password",
                },
            });
            const { res, next, clearMockRes } = getMockRes();

            mockingoose(UserModel).toReturn(null, "findOne");

            await signin(req, res, next);

            expect(next).toBeCalledWith(expect.any(Error));
        });

        test("signin unmatched password", async () => {
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    password: "wrong-password",
                },
            });
            const { res, next, clearMockRes } = getMockRes();

            const obfuscatedPassword = await bcryptjs.hash("password", 10);
            var testExistingUser = {
                userId: "testuser",
                password: obfuscatedPassword,
                role: "testrole",
            };
            mockingoose(UserModel).toReturn(testExistingUser, "findOne");

            await signin(req, res, next);

            expect(next).toBeCalledWith(expect.any(Error));
        });
    });

    describe("signout tests", () => {
        test("signout success", async () => {
            const testUser = {
                userId: "testuser",
                password: "password",
                role: "testrole",
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            const testSession = {
                userId: "testuser",
                token: "testToken",
                expirationEpoch: expiration
            }
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    token: testToken,
                },
            });
            const { res, next, clearMockRes } = getMockRes();
            mockingoose(SessionModel).toReturn(testSession, "findOne");
            mockingoose(SessionModel).toReturn({
                deletedCount: 1
            }, "deleteOne");

            await signout(req, res, next);

            expect(res.status).toBeCalledWith(200);
            expect(res.json).toBeCalledWith({
                success: true
            });
        });

        test("signout invalid session", async () => {
            const testUser = {
                userId: "testuser",
                password: "password",
                role: "testrole",
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    token: testToken,
                },
            });
            const { res, next, clearMockRes } = getMockRes();
            mockingoose(SessionModel).toReturn(undefined, "findOne");

            await signout(req, res, next);

            expect(res.status).toBeCalledWith(401);
            expect(res.json).toBeCalledWith({
                success: false
            });
        });

        test("signout delete failed", async () => {
            const testUser = {
                userId: "testuser",
                password: "password",
                role: "testrole",
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            const testSession = {
                userId: "testuser",
                token: "testToken",
                expirationEpoch: expiration
            }
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    token: testToken,
                },
            });
            const { res, next, clearMockRes } = getMockRes();
            mockingoose(SessionModel).toReturn(testSession, "findOne");
            mockingoose(SessionModel).toReturn({
                deletedCount: 0
            }, "deleteOne");

            await signout(req, res, next);

            expect(res.status).toBeCalledWith(401);
            expect(res.json).toBeCalledWith({
                success: false
            });
        });
    });

    describe("register tests", () => {
        test("register success", async () => {
            const testUser = {
                userId: "testuser",
                password: "testPassword",
                role: "testrole",
            };
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    role: "testrole",
                    password: "testPassword",
                },
            });
            const expiration = Date.now() + 10000;
            const testSession = {
                userId: "testuser",
                token: "testToken",
                expirationEpoch: expiration
            }
            const { res, next, clearMockRes } = getMockRes();

            mockingoose(UserModel).toReturn(null, "findOne");
            mockingoose(UserModel).toReturn(testUser, "save");
            mockingoose(SessionModel).toReturn(testSession, "save");

            await register(req, res, next);

            expect(res.status).toBeCalledWith(200);
            expect(res.json).toBeCalledWith({
                success: true,
                data: {
                    userId: testUser.userId,
                    role: testUser.role,
                    token: expect.any(String),
                },
            });
        });

        test("register user exists", async () => {
            const testUser = {
                userId: "testuser",
                password: "testPassword",
                role: "testrole",
            };
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    role: "testrole",
                    password: "testPassword",
                },
            });
            const { res, next, clearMockRes } = getMockRes();

            mockingoose(UserModel).toReturn(testUser, "findOne");

            await register(req, res, next);

            expect(next).toBeCalledWith(expect.any(Error));
        });

        test("register user exists", async () => {
            const testUser = {
                userId: "testuser",
                password: "testPassword",
                role: "testrole",
            };
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    role: "testrole",
                    password: "testPassword",
                },
            });
            const { res, next, clearMockRes } = getMockRes();

            mockingoose(UserModel).toReturn(testUser, "findOne");

            await register(req, res, next);

            expect(next).toBeCalledWith(expect.any(Error));
        });

        test("register save user fails", async () => {
            const testUser = {
                userId: "testuser",
                password: "testPassword",
                role: "testrole",
            };
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    role: "testrole",
                    password: "testPassword",
                },
            });
            const expiration = Date.now() + 10000;
            const testSession = {
                userId: "testuser",
                token: "testToken",
                expirationEpoch: expiration
            }
            const { res, next, clearMockRes } = getMockRes();

            mockingoose(UserModel).toReturn(null, "findOne");
            mockingoose(UserModel).toReturn(Error("DB Error"), "save");

            await register(req, res, next);

            expect(next).toBeCalledWith(expect.any(Error));
        });

        test("register save session fails", async () => {
            const testUser = {
                userId: "testuser",
                password: "testPassword",
                role: "testrole",
            };
            const req = getMockReq({
                body: {
                    userId: "testuser",
                    role: "testrole",
                    password: "testPassword",
                },
            });
            const expiration = Date.now() + 10000;
            const testSession = {
                userId: "testuser",
                token: "testToken",
                expirationEpoch: expiration
            }
            const { res, next, clearMockRes } = getMockRes();

            mockingoose(UserModel).toReturn(null, "findOne");
            mockingoose(UserModel).toReturn(testUser, "save");
            mockingoose(SessionModel).toReturn(Error("DB Error"), "save");

            await register(req, res, next);

            expect(next).toBeCalledWith(expect.any(Error));
        });
    });
});
