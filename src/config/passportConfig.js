const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth20').Strategy
const { createUser, foundUser } = require('../services/user.services')

passport.use(new GoogleStrategy(
	{
		clientID: process.env.CLIENT_ID,
		clientSecret: process.env.CLIENT_SECRET,
		callbackURL: process.env.CALL_BACK_URL
	},
	async function (accessToken, refreshToken, profile, cb) {
		const {
			sub,
			given_name,
			family_name,
			email
		} = profile._json
		let currentUser = await foundUser(email)
		if (!currentUser){
			const user = await createUser(given_name, family_name, email, null, sub)
			return cb(null, user)
		}
		cb(null, currentUser)
	}
))
