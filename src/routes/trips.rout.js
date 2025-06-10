const tripsRouter = require('express').Router();
const { tripController } = require('../controllers/trip.controllers');
const catchAsync = require('../utils/asyncWrapper.utils');

tripsRouter.get('/', catchAsync(tripController));

module.exports = {
	tripsRouter
};