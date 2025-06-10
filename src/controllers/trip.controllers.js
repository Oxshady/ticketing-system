const { getTrips } = require('../services/trips.services');
const { BadRequestError } = require('../utils/errorTypes.utils');


const tripController = async (req, res) =>{
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const { tripId } = req.body;
	if (!tripId) {
		throw new BadRequestError('Trip ID is required');
	}
	const tripsData = await getTrips(page, limit, tripId);
	console.log(tripsData);
	res.status(200).json({
		message: 'Trips retrieved successfully',
		data: tripsData,
	});
}

module.exports = {
	tripController,
};