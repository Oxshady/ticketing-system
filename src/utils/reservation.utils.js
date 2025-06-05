const prisma = require('../config/prisma/client');

const ReservationPrice = async (tripId, seatIds, tripTourPackageId) => {
	const classPrices = {
		'economy': 0,
		'business': 50,
		'first_class': 100
	};

	if (!Array.isArray(seatIds) || seatIds.length === 0) {
		throw new Error('At least one seatId must be provided');
	}

	let totalPrice = 0;

	if (!tripId && !tripTourPackageId) {
		throw new Error('Either tripId or tripTourPackageId must be provided');
	}

	if (tripTourPackageId && !tripId) {
		const tripTourPackage = await prisma.tripTourPackage.findUnique({
			where: { id: tripTourPackageId },
			select: {
				trip: {
					select: {
						price: true,
					}
				},
				tourPackage: {
					select: {
						price: true,
					}
				}
			}
		});
		console.log('tripTourPackage', tripTourPackage);
		if (!tripTourPackage) {
			throw new Error('Trip Tour Package not found');
		}

		const tripPrice = tripTourPackage.trip.price;
		const packagePrice = tripTourPackage.tourPackage.price;
		console.log('tripPrice', tripPrice, 'packagePrice', packagePrice);
		if (tripPrice === undefined || packagePrice === undefined) {
			throw new Error('Trip or Package price not found');
		}

		totalPrice += tripPrice + packagePrice;
	} else if (tripId && !tripTourPackageId) {
		const trip = await prisma.trip.findUnique({
			where: { id: tripId },
			select: {
				price: true,
			}
		});

		if (!trip) {
			throw new Error('Trip not found');
		}

		totalPrice += trip.price;
	}

	for (const seatId of seatIds) {
		const seatClass = await prisma.seat.findUnique({
			where: { id: seatId },
			select: {
				class: true,
			}
		});

		if (!seatClass?.class) {
			throw new Error(`Seat with ID ${seatId} not found or missing class`);
		}

		const seatPrice = classPrices[seatClass.class.toLowerCase()];
		if (seatPrice === undefined) {
			throw new Error(`Invalid seat class: ${seatClass.class}`);
		}
		console.log(`Seat ID: ${seatId}, Class: ${seatClass.class}, Price: ${seatPrice}`);
		totalPrice += seatPrice;
	}
	console.log('Total Price:', totalPrice);
	return totalPrice;
};

module.exports = {
	ReservationPrice,
};
