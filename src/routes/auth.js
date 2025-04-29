const auth = require('express').Router()

auth.get('/login', (req, res) => {
	const {
		firstName,
		lastName,
		email,
		password
	} = req.body
	
})