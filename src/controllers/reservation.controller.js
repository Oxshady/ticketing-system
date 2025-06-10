const { ReservationPrice } = require('../utils/reservation.utils');
const { createReservation, reservationStatusUpdate ,getReservationById, reservationsByUserId} = require('../services/reservation.services');
const { initiatePayment, paymentGateway } = require('../services/payment.services');
const { createTicket, updateTicketStatus } = require('../services/ticket.services');
const { getUser } = require('../services/user.services');
const { createPayment } = require('../services/payment.services');
const { calculatePartialDiscount } = require('../services/redeemption.services');
const { BadRequestError, PaymentError, DatabaseError } = require('../utils/errorTypes.utils');
const { getTrainClass } = require('../services/train.services');
const { reducePoints } = require('../services/loyality.services');

const fullRedemptionPointsCost = {
  third_class_ac: 700,
  second_class_non_ac: 950,
  second_class_ac: 1200,
  first_class_ac: 1800,
  sleeper_shared_class: 2500,
  sleeper_single_class: 3500,
};


async function validateRequestBody(reqBody) {
	const { tripId, tripTourPackageId, seatIds } = reqBody;
	if ((!tripId && !tripTourPackageId) || !seatIds || seatIds.length === 0) {
		throw new BadRequestError('Missing required fields: tripId or tripTourPackageId, and seatIds');
	}
	if (tripId && tripTourPackageId) {
		throw new BadRequestError('Provide either tripId or tripTourPackageId, not both');
	}
}

async function calculateReservationPriceAndClass(tripId, tripTourPackageId, seatIds) {
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

function applyPartialDiscount(user, pointsToRedeem, price) {
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

function applyFullRedemption(user, trainClass) {
	const requiredPoints = fullRedemptionPointsCost[trainClass.toLowerCase()];
	if (!requiredPoints) {
		throw new BadRequestError('Full redemption not available for this train class');
	}
	if (user.points < requiredPoints) {
		throw new BadRequestError('Insufficient points for full redemption');
	}
	return { price: 0, pointsUsed: requiredPoints };
}

async function handleFullRedemptionFlow(userId, reservation, tickets, pointsUsed, res) {
	let updatedTickets = []
	let updatedReservation = null;
	await reducePoints(userId, pointsUsed);
	for (const ticket of tickets) {
		updatedTickets.push(await updateTicketStatus(ticket.id, 'RESERVED'));
	}
	updatedReservation = await reservationStatusUpdate(reservation.id, 'CONFIRMED');
	return res.status(201).json({reservation: updatedReservation});
}


const makeReservation = async (req, res) => {
	const {tripId, tripTourPackageId, seatIds, pointsToRedeem, redemptionType } = req.body;
	const userId = req.user.id;
	const user = await getUser(userId);
	if (!user) throw new DatabaseError('User not found');

	await validateRequestBody(req.body);

	let { price, trainClass } = await calculateReservationPriceAndClass(tripId, tripTourPackageId, seatIds);

	let pointsUsed = 0;
	let discount = 0;

	if (redemptionType === 'partial_discount' && pointsToRedeem > 0) {
		({ price, pointsUsed, discount } = applyPartialDiscount(user, pointsToRedeem, price));
	} else if (redemptionType === 'full_discount') {
		({ price, pointsUsed } = applyFullRedemption(user, trainClass));
	}

	if (price <= 0 && redemptionType !== 'full_discount') {
		throw new BadRequestError('Invalid calculated price');
	}

	const reservation = await createReservation(userId, tripId, tripTourPackageId, price);
	if (!reservation) throw new DatabaseError('Failed to create reservation');

	const tickets = await createTicket(reservation, seatIds);
	if (!tickets || tickets.length === 0) throw new DatabaseError('Failed to create tickets');

	if (redemptionType === 'full_discount') {
		return handleFullRedemptionFlow(userId, reservation, tickets, pointsUsed, res);
	}

	const amountInCents = Math.round(price * 100);
	const paymentResponse = await initiatePayment(amountInCents, user);
	if (!paymentResponse?.client_secret) throw new PaymentError('Payment initiation failed');

	const payment = await createPayment(price, reservation.id, userId, paymentResponse.intention_order_id, pointsUsed);
	const paymentUrl = await paymentGateway(paymentResponse);
	if (!paymentUrl) throw new PaymentError('Payment URL generation failed');

	res.status(201).json({ paymentUrl });
};


const getReservationController = async (req, res) => {
	const { reservationId } = req.body;
	if (!reservationId) {
		throw new BadRequestError('Reservation ID is required');
	}

	const reservation = await getReservationById(reservationId);
	if (!reservation) {
		return res.status(404).json({ message: 'Reservation not found' });
	}

	return res.status(200).json(reservation);
};

const getReservationOfUserController = async (req, res) => {
	const userId = req.user.id;
	if (!userId) {
		throw new BadRequestError('User ID is required');
	}

	const reservations = await reservationsByUserId(userId);
	if (!reservations || reservations.length === 0) {
		return res.status(404).json({ message: 'No reservations found for this user' });
	}

	return res.status(200).json(reservations);
}

module.exports = {
	makeReservation,
	getReservationController,
	getReservationOfUserController
};
