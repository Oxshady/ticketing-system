const jwt = require('jsonwebtoken')
const secret = process.env.secret || "jdsnjsdnjkdsn"

const createToken = async (payload) =>{
	const token = jwt.sign(payload, secret)
	return 'Bearer ' + token
}
const verifyToken = async (encodedToken) =>{
	try{
		const token = encodedToken.split(' ')[1]
		const user = jwt.verify(token, secret)
		return user
	}
	catch (error){
		if (error.name === "TokenExpiredError"){
			return null
		} else if (error.name === "JsonWebTokenError")
		{
			return undefined
		}
		else {
			return NaN
		}
	}
}

module.exports = {
	createToken,
	verifyToken
}