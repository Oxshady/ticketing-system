const auth = require('express').Router()
const passport = require('passport')
const passportConfig = require('../config/passportConfig')
const {registerValidator, loginValidator} = require('../middlewares/auth.validator')

const { registerConstoller, loginController, googleAuth } = require('../controllers/auth.controllers')
auth.post('/register', registerValidator(),registerConstoller)
auth.post('/login', loginValidator() ,loginController)
auth.get('/google', passport.authenticate('google', {scope: ['profile', 'email'], session: false}))
auth.get('/google/callback', passport.authenticate('google', {failureRedirect: '/login', session:false}), googleAuth)
module.exports = {
	auth
}