const payment = require('express').Router()
const catchAsync = require('../utils/asyncWrapper.utils');
const { redirectController, statusController } = require('../controllers/payment.controller');
payment.post('/status', catchAsync(statusController))
payment.get('/redirect', catchAsync(redirectController))

module.exports = {
	payment
}