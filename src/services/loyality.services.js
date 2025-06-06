const prisma = require('../config/prisma/client');

const POINTS_MULTIPLIER = {
	Talgo_First_Class: 2,
	Talgo_Second_Class: 1.5,
	First_Class_AC: 1.5,
	Second_Class_AC: 1,
	Second_Class_Non_AC: 0.7,
	Third_Class_AC: 0.8,
	Third_Class_Non_AC: 0.5,
	Sleeper_shared_Class: 1.5,
	Sleeper_single_class: 2,
};

const getSeatClassPrice = async(seatId) => {
	const seatClassPrices = {
		economy: 0,
		business: 50,
		first_class: 100
	};
	const seat = await prisma.seat.findUnique({
		where: { id: seatId },
		select: { class: true },
	});
	if (!seat) throw new Error('Seat not found');
	return seatClassPrices[seat.class] || 0;
}

const getTripPrice = async (tripId) => {
	const trip = await prisma.trip.findUnique({
		where: { id: tripId },
		select: { price: true },
	});
	if (!trip) throw new Error('Trip not found');
	return trip.price || 0;
}

const getTripTourPackagePrice = async (tripTourPackageId) => {
	const tripTourPackage = await prisma.tripTourPackage.findUnique({
		where: { id: tripTourPackageId },
		include: {
			trip: {
				select: { price: true },
			},
			tourPackage: {
				select: { price: true },
			},
		},
	});
	if (!tripTourPackage) throw new Error('Trip Tour Package not found');
	const tripPrice = tripTourPackage.trip.price || 0;
	const tourPackagePrice = tripTourPackage.tourPackage.price || 0;
	return tripPrice + tourPackagePrice;
};

const isTripTourPackage = async (tripId, tripTourPackageId) => {
	return tripTourPackageId !== null && tripTourPackageId !== undefined;
};

const getPointsmultiplier = async (reservation) => {
	if (await isTripTourPackage(reservation.tripId, reservation.tripTourPackageId)) {
		const trainClass = await prisma.tripTourPackage.findUnique({
			where: { id: reservation.tripTourPackageId },
			include: {
				trip: {
					include: {
						train: {
							select: { type: true },
						},
					},
				},
			},
		});
		console.log('trainClass', trainClass);
		if (!trainClass || !trainClass.trip || !trainClass.trip.train) {
			throw new Error('Trip Tour Package or its train not found');
		}
		console.log('trainClass.trip.train.type', trainClass.trip.train.type);
		return POINTS_MULTIPLIER[trainClass.trip.train.type] || 1;
	} else {
		const trainClass = await prisma.trip.findUnique({
			where: { id: reservation.tripId },
			include: {
				train: {
					select: { type: true },
				},
			},
		});
		if (!trainClass || !trainClass.train) {
			throw new Error('Trip or its train not found');
		}
		return POINTS_MULTIPLIER[trainClass.train.type] || 1;
	}
}

const calculatePoints = async (reservation, seatIds) => {
	let totalPoints = 0;
	let totalPrice = 0;
	if (await isTripTourPackage(reservation.tripId, reservation.tripTourPackageId)) {
		totalPrice = await getTripTourPackagePrice(reservation.tripTourPackageId);
	} else {
		totalPrice = await getTripPrice(reservation.tripId);
	}
	for (const seatId of seatIds) {
		const seatClassPrice = await getSeatClassPrice(seatId);
		totalPrice += seatClassPrice;
	}
	const pointsMultiplier = await getPointsmultiplier(reservation);
	totalPoints = Math.round(totalPrice * pointsMultiplier);
	return totalPoints;
}

const getUserLoyaltyPoints = async (userId) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { points: true },
	});

	if (!user) throw new Error('User not found');

	return user.points || 0;
};

const getSeatsIds = async (reservation) => {
	if (!reservation || !reservation.id) {
		throw new Error('Invalid reservation');
	}
	const tickets = await prisma.ticket.findMany({
		where: { reservationId: reservation.id },
		select: { seatId: true },
	});
	return tickets.map(ticket => ticket.seatId);
};

const addLoyaltyPoints = async (userId, points) => {
	if (points <= 0) throw new Error('Points must be greater than zero');
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});
	if (!user) throw new Error('User not found');
	await prisma.user.update({
		where: { id: userId },
		data: { points: { increment: points } },
	});
	return await getUserLoyaltyPoints(userId);
};

module.exports = {
	calculatePoints,
	getUserLoyaltyPoints,
	addLoyaltyPoints,
	getSeatsIds,
};