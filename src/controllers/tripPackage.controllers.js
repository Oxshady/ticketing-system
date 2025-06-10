const { getTripTourPackages } = require('../services/trips.services');

const tripTourPackageController = async (req, res) => {
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const { tripId } = req.body;
	if (!tripId) {
		throw new BadRequestError('Trip ID is required');
	}
	const tripTourPackagesData = await getTripTourPackages(page, limit, tripId);
	res.status(200).json({
		message: 'Trip Tour Packages retrieved successfully',
		data: tripTourPackagesData,
	});
}

module.exports = {
	tripTourPackageController,
};