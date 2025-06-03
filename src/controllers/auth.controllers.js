const {createUser, foundUser} = require('../services/user.services')
const {comparePassword} = require('../utils/password.utils')
const {createToken} = require('../utils/jwtHelper.utils')
const validator = require('express-validator');


const loginController = async (req, res) => {
	const errors = validator.validationResult(req)
	if(!errors.isEmpty())
		return res.json(errors.array())
	const { email , password } = req.body
	const user = await foundUser(email)
	if (!user)
		return res.json({
			msg: "user not found"
		})
	if (!await comparePassword(user.password, password))
		return res.json({
		msg: "wrong password"
		})
		
	const token = await createToken({
		id: user.id,
		email: user.email
	})
	return res.json({
		token
	})
}

const registerConstoller = async (req, res) => {
	const errors = validator.validationResult(req)
	if(!errors.isEmpty())
		return res.json(errors.array())
	const {
		firstName,
		lastName,
		email,
		password
	} = req.body;
	if (await foundUser(email)){
		return res.json({
			msg:"user already found"
		})
	}
	const user = await createUser(firstName, lastName, email, password)
	const token = await createToken({
		id: user.id,
		email: user.email
	})
	return res.json({
		token
	})
}

const googleAuth = async (req, res)=>{
	const token = await createToken({
		id: req.user.id,
		email: req.user.email
	})
	console.log(req.user)
	return res.json({
		token
	})
}

module.exports = {
	registerConstoller
	,loginController,
	googleAuth
}