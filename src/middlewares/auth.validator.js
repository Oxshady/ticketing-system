const validator = require('express-validator');


const registerValidator = () => {
    return [
        validator.body('firstName')
        .notEmpty()
        .withMessage('First name cannot be empty')
        .isLength({ min: 2, max: 30 })
        .withMessage('First name must be between 2 and 30 characters'),

        validator.body('lastName')
        .notEmpty()
        .withMessage('Last name cannot be empty')
        .isLength({ min: 2, max: 30 })
        .withMessage('Last name must be between 2 and 30 characters'),

        validator.body('email')
        .notEmpty()
        .withMessage('Email cannot be empty')
        .isEmail()
        .withMessage('Please enter a valid email address'),

        validator.body('password')
        .notEmpty()
        .withMessage('Password cannot be empty')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
            returnFailedValidators: false
        })
        .withMessage('Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one symbol')
    ];
};


const loginValidator = () => {
    return [
        validator.body('email')
        .notEmpty()
        .withMessage('Email cannot be empty')
        .isEmail()
        .withMessage('Please enter a valid email address'),

        validator.body('password')
        .notEmpty()
        .withMessage('Password cannot be empty')
    ];
};

module.exports = {
    registerValidator,
    loginValidator
};