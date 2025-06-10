const { encryptPassword } = require('../utils/password.utils')
const prisma = require('../config/prisma/client')

const createUser = async (firstName, lastName, email, pass, googleId = null) => {
	let userData = {
		firstName,
		lastName,
		email
	};

	if (googleId && pass) {
		throw new Error('Provide either a password or a Google ID, not both.');
	}

	if (googleId) {
		userData.googleId = googleId;
	} else if (pass) {
		userData.password = await encryptPassword(pass);
	} else {
		throw new Error('You must provide either a password or a Google ID.');
	}

	return await prisma.user.create({
		data: userData
	});
};


const getUsers = async () => {
	const users = await prisma.user.findMany()
	return users
}

const getUser = async (id) => {
	const user = await prisma.user.findUnique(
		{
			where: {
				id
			},
			include: {
				password: false,
				googleId: false
			}
		}
	)
	return user
}

const updateData = async (id, data) => {
	const ALLOWED_DATA = ["firstName", "lastName", "email"]
	const filteredData = {}
	for (const key in data) {
		if (ALLOWED_DATA.includes(key)) {
			filteredData[key] = data[key]
		}
	}
	const user = await prisma.user.update({
		where: {
			id
		},
		data: filteredData
	})
	return {
		id: user.id,
		firstName: user.firstName,
		lastName: user.lastName,
		email: user.email
	}
}

const deleteUser = async (id) => {
	const user = await prisma.user.delete({
		where: {
			id
		},
	})
	return user.firstName + ' ' + user.lastName
}

const foundUser = async (email) => {
	const user = await prisma.user.findUnique({
		where: {
			email
		},
	})
	if (user)
		return user
}
module.exports = {
	createUser,
	getUser,
	getUsers,
	updateData,
	deleteUser,
	foundUser
}