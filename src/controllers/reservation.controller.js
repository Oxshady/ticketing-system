const { createReservation ,getReservationById, reservationsByUserId} = require('../services/reservation.services');
const { initiatePayment, paymentGateway } = require('../services/payment.services');
const { createTicket } = require('../services/ticket.services');
const { getUser } = require('../services/user.services');
const { createPayment } = require('../services/payment.services');
const { BadRequestError, PaymentError, DatabaseError } = require('../utils/errorTypes.utils');
const {
	calculateReservationPriceAndClass,
	applyPartialDiscount,
	applyFullRedemption,
	handleFullRedemptionFlow,
	validateRequestBody,
} = require('../utils/reservation.utils');
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
	if (reservation.userId !== req.user.id) {
		throw new BadRequestError('You do not have permission to view this reservation');
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
