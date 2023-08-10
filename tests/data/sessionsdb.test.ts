import { SessionModel } from '../../src/models/session';
import { checkIfSessionActive, createUserSessionAndRetrieveToken, deleteSession, signJWT } from '../../src/data/sessionsdb';
import jwt from "jsonwebtoken";

const mockingoose = require("mockingoose");

describe("sessionsdb tests", () => {
    beforeEach(() => {
       mockingoose.resetAll();
    });
    describe("createUserSessionAndRetrieveToken tests", () => {
        test("createUserSessionAndRetrieveToken happy case", async () => {
            mockingoose(SessionModel).toReturn({}, "save");

            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            var token = await createUserSessionAndRetrieveToken(testUser)

            expect(token).toBeDefined();
            expect(token).not.toBe('');

            const decodedToken = jwt.decode(token) as jwt.JwtPayload;
            expect(decodedToken.userId).toBe(testUser.userId);
            expect(decodedToken.role).toBe(testUser.role);
        });
    });

    describe("checkIfSessionActive tests", () => {
        test("checkIfSessionActive returns true for active sessions", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            mockingoose(SessionModel).toReturn({
                _id: "testId",
                token: testToken,
                expirationEpoch: expiration,
            }, "findOne");

            var isActive = await checkIfSessionActive(testToken, testUser.userId)

            expect(isActive).toBeDefined();
            expect(isActive).toBeTruthy();
        });

        test("checkIfSessionActive returns false for inactive sessions", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            mockingoose(SessionModel).toReturn(undefined, "findOne");

            var isActive = await checkIfSessionActive(testToken, testUser.userId)

            expect(isActive).toBeDefined();
            expect(isActive).toBeFalsy();
        });
    });

    describe("deleteSession tests", () => {
        test("deleteSession happy case", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            mockingoose(SessionModel).toReturn({
                _id: "testId",
                token: testToken,
                expirationEpoch: expiration,
            }, "findOne");
            mockingoose(SessionModel).toReturn({
                deletedCount: 1
            }, "deleteOne");

            var deleteResult = await deleteSession(testToken, testUser.userId);

            expect(deleteResult).toBeTruthy();
        });

        test("deleteSession invalidSession", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            mockingoose(SessionModel).toReturn(undefined, "findOne");

            var deleteResult = await deleteSession(testToken, testUser.userId);

            expect(deleteResult).toBeFalsy();
        });

        test("deleteSession delete failed", async () => {
            var testUser = {
                userId: 'testuser',
                password: 'testPassword',
                role: 'testrole',
            };
            const expiration = Date.now() + 10000;
            const testToken = signJWT(testUser, expiration);
            mockingoose(SessionModel).toReturn({
                _id: "testId",
                token: testToken,
                expirationEpoch: expiration,
            }, "findOne");
            mockingoose(SessionModel).toReturn({
                deletedCount: 0
            }, "deleteOne");

            var deleteResult = await deleteSession(testToken, testUser.userId);

            expect(deleteResult).toBeFalsy();
        });
    });
});