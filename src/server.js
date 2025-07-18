const express = require("express")
require('dotenv').config()
const app = express()
const { auth } = require('./routes/auth')
const { payment } = require('./routes/payment.rout')
const { reservation } = require('./routes/reservation.rout')
const {globalErrorHandler} = require('./middlewares/errorHandler.middleware')
const {tripPackageRouter} = require('./routes/tripPackage.rout')
const {tripsRouter} = require('./routes/trips.rout')
const {userRouter} = require('./routes/user.rout')	
const {adminRouter} = require('./routes/admin.rout')
app.use(express.json())
app.use('/api/auth', auth)
app.use('/api/payment', payment)
app.use('/api/reservation', reservation)
app.use('/api/tripTourPackage', tripPackageRouter)
app.use('/api/trip', tripsRouter)
app.use('/api/user',userRouter)
app.use('/api/admin', adminRouter)
app.use(globalErrorHandler)

app.listen(4444, () => {
	console.log("run on http://localhost:4444/")
})