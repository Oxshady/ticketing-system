const prisma = require('../config/prisma/client');

const getTrips = async (page = 1, limit = 10) => {
	page = parseInt(page) || 1;
	limit = parseInt(limit) || 10;
	if (page < 1) page = 1;
	if (limit < 1) limit = 10;
	if (limit > 50) limit = 50;

	const skip = (page - 1) * limit;
	const [trips, totalTrips] = await Promise.all([
		prisma.trip.findMany({
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				train: true,
				tripTourPackage: true,
				tickets: true,
			},
		}),
		prisma.trip.count(),
	]);

	return {
		trips,
		totalTrips,
		totalPages: Math.ceil(totalTrips / limit),
		currentPage: page,
		hasNextPage: page * limit < totalTrips,
		hasPrevPage: page > 1,
	};
};

const getTripTourPackages = async (page = 1, limit = 10) => {
	page = parseInt(page) || 1;
	limit = parseInt(limit) || 10;
	if (page < 1) page = 1;
	if (limit < 1) limit = 10;
	if (limit > 50) limit = 50;

	const skip = (page - 1) * limit;
	const [tripTourPackages, totalTripTourPackages] = await Promise.all([
		prisma.tripTourPackage.findMany({
			skip,
			take: limit,
			orderBy: { createdAt: 'desc' },
			include: {
				trip: true,
				package: true,
			},
		}),
		prisma.tripTourPackage.count(),
	]);

	return {
		tripTourPackages,
		totalTripTourPackages,
		totalPages: Math.ceil(totalTripTourPackages / limit),
		currentPage: page,
		hasNextPage: page * limit < totalTripTourPackages,
		hasPrevPage: page > 1,
	};
};

module.exports = {
	getTrips,
	getTripTourPackages,
};