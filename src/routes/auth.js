const auth = require('express').Router()
const passport = require('passport')
const passportConfig = require('../config/passportConfig')
const {registerValidator, loginValidator} = require('../middlewares/auth.validator')
const catchAsync = require('../utils/asyncWrapper.utils')

const { registerConstoller, loginController, googleAuth } = require('../controllers/auth.controllers')
auth.post('/register', registerValidator(),catchAsync(registerConstoller))
auth.post('/login', loginValidator() ,catchAsync(loginController))
auth.get('/google', passport.authenticate('google', {scope: ['profile', 'email'], session: false}))
auth.get('/google/callback', passport.authenticate('google', {failureRedirect: '/login', session:false}), catchAsync(googleAuth))
module.exports = {
	auth
}