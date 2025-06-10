const { getTripTourPackages, getTripTourPackage} = require('../services/trips.services');
const { getAvailableSeats } = require('../services/seat.services');
const tripTourPackageController = async (req, res) => {
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const tripTourPackagesData = await getTripTourPackages(page, limit);
	res.status(200).json({
		message: 'Trip Tour Packages retrieved successfully',
		data: tripTourPackagesData,
	});
}

const tripTourPackageSeats = async (req, res) => {
	const tripTourPackageId = req.body.tripTourPackageId;
	if (!tripTourPackageId) {
		return res.status(400).json({ message: 'Trip Tour Package ID is required' });
	}
	const tripTourPackage = await getTripTourPackage(tripTourPackageId);
	if (!tripTourPackage) {
		return res.status(404).json({ message: 'Trip Tour Package not found' });
	}
	const availableSeats = await getAvailableSeats(tripTourPackage.trip);
	if (!availableSeats || availableSeats.length === 0) {
		return res.status(404).json({ message: 'No available seats found for this trip' });
	}
	res.status(200).json({
		message: 'Available seats retrieved successfully',
		data: availableSeats,
	});
}

module.exports = {
	tripTourPackageController,
	tripTourPackageSeats
};