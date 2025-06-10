const tripsRouter = require('express').Router();
const { tripController, tripSeats } = require('../controllers/trip.controllers');
const catchAsync = require('../utils/asyncWrapper.utils');

tripsRouter.get('/', tripController);
tripsRouter.get('/seats', tripSeats)
module.exports = {
	tripsRouter
};