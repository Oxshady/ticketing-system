const prisma = require('../config/prisma/client');
const { BadRequestError } = require('../utils/errorTypes.utils');
const { getTrainClass } = require('../services/train.services');
const { reducePoints } = require('../services/loyality.services');
const { calculatePartialDiscount } = require('../services/redeemption.services');
const { updateTicketStatus } = require('../services/ticket.services');
const { reservationStatusUpdate } = require('../services/reservation.services');
const fullRedemptionPointsCost = {
  third_class_ac: 700,
  second_class_non_ac: 950,
  second_class_ac: 1200,
  first_class_ac: 1800,
  sleeper_shared_class: 2500,
  sleeper_single_class: 3500,
};

const calculateReservationPriceAndClass = async (tripId, tripTourPackageId, seatIds) => {
	let price, trainClass;

	if (tripTourPackageId) {
		price = await ReservationPrice(null, seatIds, tripTourPackageId);
		trainClass = await getTrainClass(null, tripTourPackageId);
	} else {
		price = await ReservationPrice(tripId, seatIds, null);
		trainClass = await getTrainClass(tripId, null);
	}

	if (!trainClass) {
		throw new BadRequestError('Could not determine train class');
	}

	return { price, trainClass };
}

const applyPartialDiscount = (user, pointsToRedeem, price) => {
	if (pointsToRedeem > user.points) {
		throw new BadRequestError('Insufficient points for partial discount');
	}
	const { pointsUsed, discount } = calculatePartialDiscount(pointsToRedeem, user.points);
	console.log('Points used:', pointsUsed, 'Discount:', discount);
	if (discount >= price) {
		throw new BadRequestError('Discount exceeds or equals the total price');
	}
	return { price: price - discount, pointsUsed, discount };
}

const handleFullRedemptionFlow = async (userId, reservation, tickets, pointsUsed, res) => {
	let updatedTickets = []
	let updatedReservation = null;
	await reducePoints(userId, pointsUsed);
	for (const ticket of tickets) {
		updatedTickets.push(await updateTicketStatus(ticket.id, 'RESERVED'));
	}
	updatedReservation = await reservationStatusUpdate(reservation.id, 'CONFIRMED');
	return res.status(201).json({reservation: updatedReservation});
}

const applyFullRedemption = (user, trainClass) => {
	const requiredPoints = fullRedemptionPointsCost[trainClass.toLowerCase()];
	if (!requiredPoints) {
		throw new BadRequestError('Full redemption not available for this train class');
	}
	if (user.points < requiredPoints) {
		throw new BadRequestError('Insufficient points for full redemption');
	}
	return { price: 0, pointsUsed: requiredPoints };
}

const validateRequestBody = async (reqBody) => {
	const { tripId, tripTourPackageId, seatIds } = reqBody;
	if ((!tripId && !tripTourPackageId) || !seatIds || seatIds.length === 0) {
		throw new BadRequestError('Missing required fields: tripId or tripTourPackageId, and seatIds');
	}
	if (tripId && tripTourPackageId) {
		throw new BadRequestError('Provide either tripId or tripTourPackageId, not both');
	}
}

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
	calculateReservationPriceAndClass,
	applyPartialDiscount,
	applyFullRedemption,
	handleFullRedemptionFlow,
	validateRequestBody,
};
