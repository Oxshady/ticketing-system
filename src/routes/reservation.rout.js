const reservation = require('express').Router();
const prisma = require('../config/prisma/client');
const { use } = require('passport');
const {makeReservation} = require('../controllers/reservation.controller');
const catchAsync = require('../utils/asyncWrapper.utils');
const { authorizationMiddleware } = require('../middlewares/authorization.middleware');
reservation.post('/', authorizationMiddleware, catchAsync(makeReservation));

module.exports = {
	reservation
};