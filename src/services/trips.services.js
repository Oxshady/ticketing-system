const prisma = require('../config/prisma/client');

const getTrips = async (page = 1, limit = 10) => {
	page = parseInt(page) || 1;
	limit = parseInt(limit) || 10;
	if (page < 1) page = 1;
	if (limit < 1) limit = 10;
	if (limit > 50) limit = 50;

	const skip = (page - 1) * limit;
	const trips = await prisma.trip.findMany({
		skip,
		take: limit,
		orderBy: { createdAt: 'desc' },
		include: {
			train: true,
		},
	});
	const totalTrips = await prisma.trip.count(); 
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
	const tripTourPackages = await prisma.tripTourPackage.findMany({
		skip,
		take: limit,
		orderBy: { createdAt: 'desc' },
		include: {
			trip: true,
			tourPackage: true,
		},
	});
	const totalTripTourPackages = await prisma.tripTourPackage.count(); 

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