const bcrypt = require('bcrypt')

const encryptPassword = async (password) => {
	const saltRounds = 10
	const salt = await bcrypt.genSalt(saltRounds)
	const hashedPassword = await bcrypt.hash(password, salt)
	return hashedPassword
}

const comparePassword = async (hashedPassword, password) => {
	const match = await bcrypt.compare(password, hashedPassword)
	return match
}

module.exports = {
	encryptPassword,
	comparePassword
}
