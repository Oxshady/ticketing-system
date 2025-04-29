const express = require("express")
const { PrismaClient } = require("@prisma/client")
const app = express()
const prisma = new PrismaClient()
app.use(express.json())

app.get('/', async (req, res)=>{
	const newUser = await prisma.user.create(
		{
			data:
			{
				firstName: "shadi",
				lastName: "mahmoud",
				email,
				password
			}
			
		}
	)
	res.json(newUser)
})

app.listen(4444, ()=>{
	console.log("run on http://localhost:4444/")
})