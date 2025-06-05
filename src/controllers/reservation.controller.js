const { ReservationPrice } = require('../utils/reservation.utils');
const { createReservation } = require('../services/reservation.services');
const { initiatePayment, paymentGateway } = require('../services/payment.services');
const { createTicket } = require('../services/ticket.services');
const { getUser } = require('../services/user.services');
const { createPayment } = require('../services/payment.services');
const { BadRequestError, PaymentError, DatabaseError } = require('../utils/errorTypes.utils');

const makeReservation = async (req, res) => {
	const { userId, tripId, tripTourPackageId, seatIds } = req.body;

	if ((!tripId && !tripTourPackageId) || !userId || !seatIds || seatIds.length === 0) {
		throw new BadRequestError('Missing required fields: userId, tripId or tripTourPackageId, and seatIds');
	}
	if (tripId && tripTourPackageId) {
		throw new BadRequestError('Provide either tripId or tripTourPackageId, not both');
	}

	let price = 0;
	if (tripTourPackageId) {
		price = await ReservationPrice(null, seatIds, tripTourPackageId);
	} else if (tripId) {
		price = await ReservationPrice(tripId, seatIds, null);
	}
	console.log('Calculated price:', price);
	if (price <= 0) {
		throw new BadRequestError('Invalid calculated price');
	}

	const reservation = await createReservation(userId, tripId, tripTourPackageId, price);
	if (!reservation) {
		throw new DatabaseError('Failed to create reservation');
	}
	console.log('Reservation created:', reservation);
	const user = await getUser(userId);
	if (!user) {
		throw new DatabaseError('User not found');
	}

	const amountInCents = Math.round(price * 100);
	const paymentResponse = await initiatePayment(amountInCents, user);
	if (!paymentResponse || !paymentResponse.client_secret) {
		throw new PaymentError('Payment initiation failed');
	}
	console.log("ammountInCents", amountInCents);
	const payment = await createPayment(amountInCents, reservation.id, userId, paymentResponse.intention_order_id);
	const paymentUrl = await paymentGateway(paymentResponse);
	if (!paymentUrl) {
		throw new PaymentError('Payment URL generation failed');
	}

	const tickets = await createTicket(reservation, seatIds);
	console.log('Tickets created:', tickets);
	if (!tickets || tickets.length === 0) {
		throw new DatabaseError('Failed to create tickets for the reservation');
	}

	res.status(201).json({ paymentResponse, paymentUrl });
};

module.exports = {
	makeReservation,
};
