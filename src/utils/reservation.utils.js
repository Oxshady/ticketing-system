const prisma = require('../config/prisma/client');

const ReservationPrice = async (tripId, seatIds) => {
	const classPrices = {
		'economy': 0,
		'business': 50,
		'first_class': 100
	};

	let totalPrice = 0;

	const tripPrice = await prisma.trip.findUnique({
		where: { id: tripId },
		select: {
			price: true,
		}
	});

	if (!tripPrice) {
		throw new Error('Trip not found');
	}

	totalPrice += tripPrice.price;

	for (const seatId of seatIds) {
		const seatClass = await prisma.seat.findUnique({
			where: { id: seatId },
			select: {
				class: true,
			}
		});
		console.log(seatClass.class);
		if (!seatClass.class) {
			throw new Error(`Seat with ID ${seatId} not found`);
		}

		const seatPrice = classPrices[seatClass.class.toLowerCase()];
		if (seatPrice === undefined) {
			throw new Error(`Invalid seat class: ${seatClass.class}`);
		}

		totalPrice += seatPrice;
	}

	return totalPrice;
};

module.exports = {
	ReservationPrice,
};
