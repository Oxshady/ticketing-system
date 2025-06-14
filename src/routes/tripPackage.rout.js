const tripPackageRouter = require('express').Router();
const { tripTourPackageController, tripTourPackageSeats } = require('../controllers/tripPackage.controllers');
const catchAsync = require('../utils/asyncWrapper.utils');
tripPackageRouter.get('/', tripTourPackageController);
tripPackageRouter.post('/seats', tripTourPackageSeats);
module.exports = {
	tripPackageRouter
};