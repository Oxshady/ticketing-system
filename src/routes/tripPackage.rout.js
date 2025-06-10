const tripPackageRouter = require('express').Router();
const { tripTourPackageController } = require('../controllers/tripPackage.controllers');
const catchAsync = require('../utils/asyncWrapper.utils');
tripPackageRouter.get('/', catchAsync(tripTourPackageController));
module.exports = {
	tripPackageRouter
};