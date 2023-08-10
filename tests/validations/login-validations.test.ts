import { Request } from "express";
import {
    signinValidations,
    signoutValidations,
    registerValidations,
} from "../../src/validations/login-validations";
import { validationResult, ValidationChain } from "express-validator";

// NOTE* - the below tests should ideally be autogenerating the test inputs used for validation
// However, due to time constraints, I do not have time to implement the generation logic

// sequential processing, stops running validations chain if the previous one fails.
const validate = (validations: ValidationChain[]) => {
    return async (req: Request) => {
        for (let validation of validations) {
            const result = await validation.run(req);
            if (result.array().length) break;
        }

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return [];
        }

        return errors.array();
    };
};

describe("signin validations", () => {
    test("signInValidation happy case", async () => {
        // setup
        const testFunction = validate(signinValidations);
        const mockRequest = {
            body: {
                userId: "testuser",
                password: "password",
            },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        //verify
        expect(errors.length).toBe(0);
    });

    it.each([
        { password: "Asdf1sdf¡sdf" },
        { userId: "", password: "Asdf1sdf¡sdf" },
    ])(
        "signInValidation fail when user not exists or empty",
        async (testBody) => {
            // setup
            const testFunction = validate(signinValidations);
            const mockRequest = {
                body: testBody,
            } as Request;
            // test
            const errors = await testFunction(mockRequest);

            // verify
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe("field");
            expect(errors[0].msg).toBe("Invalid value");
        }
    );

    it.each([{ userId: "testuser" }, { userId: "testuser", password: "" }])(
        "signInValidation fail when password not exists or empty",
        async (testBody) => {
            // setup
            const testFunction = validate(signinValidations);
            const mockRequest = {
                body: testBody,
            } as Request;
            // test
            const errors = await testFunction(mockRequest);

            // verify
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe("field");
            expect(errors[0].msg).toBe("Invalid value");
        }
    );
});

describe("signout validations", () => {
    test("signoutValidations happy case", async () => {
        // setup
        const testFunction = validate(signoutValidations);
        const mockRequest = {
            body: {
                userId: "testuser",
                token: "token",
            },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        //verify
        expect(errors.length).toBe(0);
    });

    it.each([{ token: "Asdf1sdf¡sdf" }, { userId: "", token: "Asdf1sdf¡sdf" }])(
        "signoutValidations fail when user not exists or empty",
        async (testBody) => {
            // setup
            const testFunction = validate(signoutValidations);
            const mockRequest = {
                body: testBody,
            } as Request;
            // test
            const errors = await testFunction(mockRequest);

            // verify
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe("field");
            expect(errors[0].msg).toBe("Invalid value");
        }
    );

    it.each([{ userId: "testuser" }, { userId: "TESTUSER", token: "" }])(
        "signoutValidations fail when password not exists or empty",
        async (testBody) => {
            // setup
            const testFunction = validate(signinValidations);
            const mockRequest = {
                body: testBody,
            } as Request;
            // test
            const errors = await testFunction(mockRequest);

            // verify
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe("field");
            expect(errors[0].msg).toBe("Invalid value");
        }
    );
});

describe("register validations", () => {
    it.each([
        { userId: "TESTUSER", password: "Asdf1sdf@sdf", role: "user" },
        { userId: "testuser^", password: "rwbSu3NZmBDjejrJ7Z5otsgf", role: "admin" },
        { userId: "TestUser", password: "BCCf97d7mebUgE6BJyzqU4p4", role: "test" },
    ])("registerValidations happy case", async () => {
        // setup
        const testFunction = validate(registerValidations);
        const mockRequest = {
            body: {
                userId: "testuser",
                password: "Asdf!sdf1sdf",
                role: "user",
            },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        //verify
        expect(errors.length).toBe(0);
    });

    it.each([
        { userId: "TEST-USER", password: "Asdf1sdf@sdf", role: "user" },
        { userId: "test123$%^", password: "Asdf1sdf@sdf", role: "user" },
        { userId: "test user", password: "Asdf1sdf@sdf", role: "user" },
    ])(
        "registerValidations fail when user is non-alphanumeric",
        async (testBody) => {
            // setup
            const testFunction = validate(registerValidations);
            const mockRequest = {
                body: testBody,
            } as Request;
            // test
            const errors = await testFunction(mockRequest);

            // verify
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe("field");
            expect(errors[0].msg).toBe("userId must be non-empty and alphanumeric only");
        }
    );

    test("registerValidations fail when password does not have lowercase", async () => {
        // setup
        const testFunction = validate(registerValidations);
        const mockRequest = {
            body: { userId: "testuser", password: "ASDF1SDF@SDF", role: "user" },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        // verify
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe("field");
        expect(errors[0].msg).toBe("password must contain at least 1 lowercase letter");
    });

    test("registerValidations fail when password does not have uppercase", async () => {
        // setup
        const testFunction = validate(registerValidations);
        const mockRequest = {
            body: { userId: "testuser", password: "asdf1sdf@sdf", role: "user" },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        // verify
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe("field");
        expect(errors[0].msg).toBe("password must contain at least 1 uppercase letter");
    });

    test("registerValidations fail when password does not have a digit", async () => {
        // setup
        const testFunction = validate(registerValidations);
        const mockRequest = {
            body: { userId: "testuser", password: "Asdfasdf@sdf", role: "user" },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        // verify
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe("field");
        expect(errors[0].msg).toBe("password must contain at least 1 digit");
    });

    test("registerValidations fail when password does not have 1 special character", async () => {
        // setup
        const testFunction = validate(registerValidations);
        const mockRequest = {
            body: { userId: "testuser", password: "Asdf1sdfasdf", role: "user" },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        // verify
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe("field");
        expect(errors[0].msg).toBe("password must contain at least 1 special character ('!@#$%^&*')");
    });

    test("registerValidations fail when password is less than 8 characters", async () => {
        // setup
        const testFunction = validate(registerValidations);
        const mockRequest = {
            body: { userId: "testuser", password: "As1s@sd", role: "user" },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        // verify
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe("field");
        expect(errors[0].msg).toBe("password must be at least 8 characters long");
    });

    test("registerValidations fail when password is less than 8 characters", async () => {
        // setup
        const testFunction = validate(registerValidations);
        const mockRequest = {
            body: { userId: "testuser", password: "Asdf1sdf@sdfAsdf1sdf@sdfAsdf1sdf@sdf", role: "user" },
        } as Request;
        // test
        const errors = await testFunction(mockRequest);

        // verify
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe("field");
        expect(errors[0].msg).toBe("password must be no longer than 32 characters long");
    });

    it.each([
        { userId: "testuser", password: "Asdf1sdf@sdf" },
        { userId: "TestUser", password: "Asdf1sdf@sdf", role: "" },
    ])(
        "registerValidations fail when role not exists or empty",
        async (testBody) => {
            // setup
            const testFunction = validate(registerValidations);
            const mockRequest = {
                body: testBody,
            } as Request;
            // test
            const errors = await testFunction(mockRequest);

            // verify
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe("field");
            expect(errors[0].msg).toBe("Invalid value");
        }
    );
});
