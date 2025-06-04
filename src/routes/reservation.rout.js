const reservation = require('express').Router();
const { ReservationPrice } = require('../utils/reservation.utils');
const { createReservation } = require('../services/reservation.services');
const { initiatePayment, paymentGateway } = require('../services/payment.services');
const { createTicket } = require('../services/ticket.services');
const prisma = require('../config/prisma/client');
const { use } = require('passport');
const { BadRequestError, PaymentError, DatabaseError } = require('../utils/errorTypes.utils');
const catchAsync = require('../utils/asyncWrapper.utils');
reservation.post('/', catchAsync(async (req, res) => {
	const { userId, tripId, tripTourPackageId, seatIds } = req.body;

	if ((!tripId && !tripTourPackageId) || !userId || !seatIds || seatIds.length === 0) {
		throw new BadRequestError('Missing required fields: userId, tripId or tripTourPackageId, and seatIds');
	}

	const price = await ReservationPrice(tripId, seatIds);
	if (price <= 0) {
		throw new BadRequestError('Invalid seat price');
	}

	const reservation = await createReservation(userId, tripId, tripTourPackageId, price);

	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { email: true, firstName: true, lastName: true }
	});

	if (!user) {
		throw new DatabaseError('User not found');
	}

	const paymentResponse = await initiatePayment(price * 100, user);
	if (!paymentResponse || !paymentResponse.client_secret) {
		throw new PaymentError('Payment initiation failed');
	}

	const payment = await prisma.payment.create({
		data: {
			amount: price,
			reservationId: reservation.id,
			userId: userId,
			paymobOrderId: JSON.stringify(paymentResponse.intention_order_id),
			method: 'CARD',
		}
	});

	const paymentUrl = await paymentGateway(paymentResponse);
	if (!paymentUrl) {
		throw new PaymentError('Payment URL generation failed');
	}

	const tickets = await createTicket(reservation, seatIds);
	if (!tickets || tickets.length === 0) {
		throw new DatabaseError('Failed to create tickets for the reservation');
	}

	res.status(201).json({ paymentResponse, paymentUrl });
}));

module.exports = {
	reservation
};