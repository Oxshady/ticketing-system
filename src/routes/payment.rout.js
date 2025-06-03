const payment = require('express').Router()
const {	initiateController, redirectController, statusController } = require('../controllers/payment.controller');
payment.post('/status', statusController)
payment.get('/redirect', redirectController)
payment.post('/initiate', initiateController)

module.exports = {
	payment
}