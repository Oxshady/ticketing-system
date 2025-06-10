const { getTrips } = require('../services/trips.services');
const { BadRequestError } = require('../utils/errorTypes.utils');


const tripController = async (req, res) =>{
	const page = req.query.page || 1;
	const limit = req.query.limit || 10;
	const tripsData = await getTrips(page, limit);
	res.status(200).json({
		message: 'Trips retrieved successfully',
		data: tripsData,
	});
}

module.exports = {
	tripController,
};