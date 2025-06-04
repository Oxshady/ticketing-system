const { createUser, foundUser } = require('../services/user.services');
const { comparePassword } = require('../utils/password.utils');
const { createToken } = require('../utils/jwtHelper.utils');
const validator = require('express-validator');
const {
	ValidationError,
	AuthenticationError,
	ConflictError,
	NotFoundError
} = require('../utils/errorTypes.utils');

const loginController = async (req, res) => {
	const errors = validator.validationResult(req);
	if (!errors.isEmpty()) {
		throw new ValidationError('Invalid login input', errors.array());
	}

	const { email, password } = req.body;
	const user = await foundUser(email);
	if (!user) {
		throw new NotFoundError('User');
	}

	const isMatch = await comparePassword(user.password, password);
	if (!isMatch) {
		throw new AuthenticationError('Incorrect password');
	}

	const token = await createToken({ id: user.id, email: user.email });
	res.status(200).json({ token });
};

const registerConstoller = async (req, res) => {
	const errors = validator.validationResult(req);
	if (!errors.isEmpty()) {
		throw new ValidationError('Invalid registration input', errors.array());
	}

	const { firstName, lastName, email, password } = req.body;
	const existingUser = await foundUser(email);
	if (existingUser) {
		throw new ConflictError('User with this email already exists');
	}

	const user = await createUser(firstName, lastName, email, password);
	const token = await createToken({ id: user.id, email: user.email });
	res.status(201).json({ token });
};

const googleAuth = async (req, res) => {
	if (!req.user) {
		throw new AuthenticationError('Google authentication failed');
	}

	const token = await createToken({ id: req.user.id, email: req.user.email });
	console.log(req.user);
	res.status(200).json({ token });
};

module.exports = {
	registerConstoller,
	loginController,
	googleAuth
};
