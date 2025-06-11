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

const getTrip = async (id) => {
	if (!id) {
		throw new Error('Trip ID is required');
	}
	const trip = await prisma.trip.findUnique({
		where: { id },
		include: {
			train: true,
		},
	});
	if (!trip) {
		throw new Error('Trip not found');
	}
	return trip;
};
const getTripTourPackage = async (id) => {
	if (!id) {
		throw new Error('Trip Tour Package ID is required');
	}
	const tripTourPackage = await prisma.tripTourPackage.findUnique({
		where: { id },
		include: {
			trip: true,
			tourPackage: true,
		},
	});
	if (!tripTourPackage) {
		throw new Error('Trip Tour Package not found');
	}
	return tripTourPackage;
};


const createTrip = async (data) => {
	if (!data || !data.trainId || !data.price || !data.source || !data.destination || !data.stationLocation || !data.status) {
		throw new Error('Missing required fields: trainId, price, source,destination, stationLocation,status');
	}
	const trip = await prisma.trip.create({
		data,
	});
	return trip;
}

const createTripTourPackage = async (data) => {
	if (!data || !data.tripId || !data.tourPackageId) {
		throw new Error('Missing required fields: tripId, tourPackageId');
	}
	const tripTourPackage = await prisma.tripTourPackage.create({
		data,
	});
	return tripTourPackage;
};

const updateTrip = async (id, data) => {
	if (!id || !data) {
		throw new Error('Trip ID and data are required for update');
	}
	const trip = await prisma.trip.update({
		where: { id },
		data,
	});
	return trip;
};
const updateTripTourPackage = async (id, data) => {
	if (!id || !data) {
		throw new Error('Trip Tour Package ID and data are required for update');
	}
	const tripTourPackage = await prisma.tripTourPackage.update({
		where: { id },
		data,
	});
	return tripTourPackage;
};

const deleteTrip = async (id) => {
	if (!id) {
		throw new Error('Trip ID is required for deletion');
	}
	const trip = await prisma.trip.delete({
		where: { id },
	});
	return trip;
};
const deleteTripTourPackage = async (id) => {
	if (!id) {
		throw new Error('Trip Tour Package ID is required for deletion');
	}
	const tripTourPackage = await prisma.tripTourPackage.delete({
		where: { id },
	});
	return tripTourPackage;
};




module.exports = {
	getTrips,
	getTripTourPackages,
	getTrip,
	getTripTourPackage,
	createTrip,
	createTripTourPackage,
	updateTrip,
	updateTripTourPackage,
	deleteTrip,
	deleteTripTourPackage

};