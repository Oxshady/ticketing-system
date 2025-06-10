const { getTripTourPackages } = require('../services/trips.services');

const tripTourPackageController = async (req, res) => {
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const tripTourPackagesData = await getTripTourPackages(page, limit);
	res.status(200).json({
		message: 'Trip Tour Packages retrieved successfully',
		data: tripTourPackagesData,
	});
}

module.exports = {
	tripTourPackageController,
};