const { getTrips, getTrip } = require('../services/trips.services');
const { BadRequestError } = require('../utils/errorTypes.utils');
const { getAvailableSeats } = require('../services/seat.services');

const tripController = async (req, res) =>{
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const tripsData = await getTrips(page, limit);
	res.status(200).json({
		message: 'Trips retrieved successfully',
		data: tripsData,
	});
}

const tripSeats = async (req, res) => {
	const tripId = req.body.tripId;
	if (!tripId) {
		return res.status(400).json({ message: 'Trip ID is required' });
	}
	const trip = await getTrip(tripId);
	if (!trip) {
		return res.status(404).json({ message: 'Trip not found' });
	}
	const availableSeats = await getAvailableSeats(trip);
	if (!availableSeats || availableSeats.length === 0) {
		return res.status(404).json({ message: 'No available seats found for this trip' });
	}
	res.status(200).json({
		message: 'Available seats retrieved successfully',
		data: availableSeats,
	});
}

module.exports = {
	tripController,
	tripSeats
};