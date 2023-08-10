import { body, ValidationChain } from "express-validator";
import { char, charIn, createRegExp, digit, exactly, letter  } from 'magic-regexp'

const userIdRequirementsValidation = body("userId", "userId must be non-empty and alphanumeric only")
    .exists()
    .trim()
    .toLowerCase()
    .notEmpty()
    .isAlphanumeric();

const passwordSpecialCharacters = '!@#$%^&*';
const passwordRequirementsValidation = body("password")
    .exists()
    .trim()
    .matches(createRegExp(exactly(letter.lowercase).times.atLeast(1)))
        .withMessage("password must contain at least 1 lowercase letter")
    .matches(createRegExp(exactly(letter.uppercase).times.atLeast(1)))
        .withMessage("password must contain at least 1 uppercase letter")
    .matches(createRegExp(exactly(digit).times.atLeast(1)))
        .withMessage("password must contain at least 1 digit")
    .matches(createRegExp(exactly(charIn(passwordSpecialCharacters)).times.atLeast(1)))
        .withMessage("password must contain at least 1 special character ('!@#$%^&*')")
    .matches(createRegExp(exactly(char).times.atLeast(8)))
        .withMessage("password must be at least 8 characters long")
    .not().matches(createRegExp(exactly(char).times.atLeast(33)))
        .withMessage("password must be no longer than 32 characters long");

const userIdExistsValidation = body("userId").exists();
const userIdIsNotEmptyValidation = body("userId").trim().notEmpty();
const passwordExistsValidation = body("password").exists();
const passwordIsNotEmptyValidation = body("password").trim().notEmpty();
const tokenExistsValidation = body("token").exists();
const tokenIsNotEmptyValidation = body("token").trim().notEmpty();
const roleExistsValidation = body("role").exists();
const roleIsNotEmptyValidation = body("role").trim().notEmpty();

export const signinValidations: ValidationChain[] = [
    userIdExistsValidation,
    userIdIsNotEmptyValidation,
    passwordExistsValidation,
    passwordIsNotEmptyValidation,
];

export const signoutValidations: ValidationChain[] = [
    userIdExistsValidation,
    userIdIsNotEmptyValidation,
    tokenExistsValidation,
    tokenIsNotEmptyValidation,
];

export const registerValidations: ValidationChain[] = [
    userIdRequirementsValidation,
    passwordRequirementsValidation,
    roleExistsValidation,
    roleIsNotEmptyValidation,
];
