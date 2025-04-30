const express = require("express")
require('dotenv').config()
const app = express()
const { auth } = require('./routes/auth')
app.use(express.json())
app.use('/api/auth', auth)

app.listen(4444, () => {
	console.log("run on http://localhost:4444/")
})