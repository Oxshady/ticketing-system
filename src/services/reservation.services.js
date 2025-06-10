const passport = require('passport');
const prisma = require('../config/prisma/client');

const createReservation = async (userId, tripId, tripTourPackageId, price) => {
	if (!userId || (!tripId && !tripTourPackageId)) {
		throw new Error('User ID, Trip ID, and Trip Tour Package ID are required to create a reservation.');
	}
	let reservation = null;
	if (tripId && !tripTourPackageId) {
		reservation = await prisma.reservation.create({
			data: {
				userId,
				tripId,
				price,
			}
		});
	}
	else if (tripTourPackageId && !tripId) {
		reservation = await prisma.reservation.create({
			data: {
				userId,
				tripTourPackageId,
				price,
			}
		});
	}
	else {
		throw new Error('You must provide either a trip ID or a trip tour package ID, but not both.');
	}
	return reservation;
}

const getReservations = async () => {
	const reservations = await prisma.reservation.findMany({
		include: {
			user: true,
			trip: true,
			tripTourPackage: true,
		},
	});
	return reservations;
};

const getReservationById = async (id) => {
	const reservation = await prisma.reservation.findUnique({
		where: {
			id,
		},
		include: {
			trip: true,
			tripTourPackage: true,
			tickets: {
				include: {
					seat: true,
				},
			},
			payment: true,
		},
	});
	return reservation;
};

const deleteReservation = async (id) => {
	const deletedReservation = await prisma.reservation.delete({
		where: {
			id,
		},
	});
	return deletedReservation;
};

const reservationsByUserId = async (userId) => {
	const reservations = await prisma.reservation.findMany({
		where: {
			userId,
		},
		include: {
			user: {
				include: {
					password: false,
					createdAt: false,
					updatedAt: false,
					googleId: false,
				},
			},
			trip: true,
			tripTourPackage: true,
		},
	});
	return reservations;
}

const reservationsByTripId = async (tripId) => {
	const reservations = await prisma.reservation.findMany({
		where: {
			tripId,
		},
		include: {
			user: true,
			trip: true,
			tripTourPackage: true,
		},
	});
	return reservations;
};

const reservationsByTripTourPackageId = async (tripTourPackageId) => {
	const reservations = await prisma.reservation.findMany({
		where: {
			tripTourPackageId,
		},
		include: {
			user: true,
			trip: true,
			tripTourPackage: true,
		},
	});
	return reservations;
};

const reservationStatusUpdate = async (id, status) => {
	const ALLOWED_STATUSES = ['PENDING', 'CONFIRMED', 'CANCELED'];
	if (!ALLOWED_STATUSES.includes(status)) {
		throw new Error(`Invalid status. Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}`);
	}

	const updatedReservation = await prisma.reservation.update({
		where: {
			id,
		},
		data: {
			status,
		},
		include: {
			user: {
				include: {
					password: false,
					createdAt: false,
					updatedAt: false,
					googleId: false,
				}
			},
			trip: true,
			tripTourPackage: true,
			tickets: true,
		},
	});
	return updatedReservation;
}

module.exports = {
	createReservation,
	getReservations,
	getReservationById,
	deleteReservation,
	reservationsByUserId,
	reservationsByTripId,
	reservationsByTripTourPackageId,
	reservationStatusUpdate
};