const { PrismaClient } = require("@prisma/client")
const {encryptPassword} = require('../utils/password.utils')
const prisma = new PrismaClient()


const createUser = async (firstName, lastName, email, pass) => {
	const password = encryptPassword(pass)
	return await prisma.user.create({
		data: {
			firstName,
			lastName,
			email,
			password
		}
	})
}

const getUsers = async () => {
	const users = await prisma.user.findMany()
	return users
}

const getUser = async (id) => {
	const user = await prisma.user.findUnique(
		{
			where: {
				id
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
}

const deleteUser = async (id) => {
	const user = await prisma.user.delete({
		where: {
			id
		}
	})
	return user
}

module.exports = {
	createUser,
	getUser,
	getUsers,
	updateData,
	deleteUser
}