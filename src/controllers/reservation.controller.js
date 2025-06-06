const { ReservationPrice } = require('../utils/reservation.utils');
const { createReservation, reservationStatusUpdate } = require('../services/reservation.services');
const { initiatePayment, paymentGateway } = require('../services/payment.services');
const { createTicket, updateTicketStatus } = require('../services/ticket.services');
const { getUser } = require('../services/user.services');
const { createPayment } = require('../services/payment.services');
const { calculatePartialDiscount } = require('../services/redeemption.services');
const { BadRequestError, PaymentError, DatabaseError } = require('../utils/errorTypes.utils');
const { el, tr } = require('@faker-js/faker');
const { getTrainClass } = require('../services/train.services');
const {reducePoints} = require('../services/loyality.services');
const { use } = require('passport');
const fullRedemptionPointsCost = {
  third_class: 700,
  second_class_non_ac: 950,
  second_class_ac: 1200,
  first_class_ac: 1800,
  shared_sleeper_cabin: 2500,
  single_sleeper_cabin: 3500,
};

const makeReservation = async (req, res) => {
	const { userId, tripId, tripTourPackageId, seatIds, pointsToRedeem, redemptionType } = req.body;
	console.log(pointsToRedeem, redemptionType);
	const user = await getUser(userId);
	let trainClass = null;
	if (!user) {
		throw new DatabaseError('User not found');
	}
	if ((!tripId && !tripTourPackageId) || !userId || !seatIds || seatIds.length === 0) {
		throw new BadRequestError('Missing required fields: userId, tripId or tripTourPackageId, and seatIds');
	}
	if (tripId && tripTourPackageId) {
		throw new BadRequestError('Provide either tripId or tripTourPackageId, not both');
	}

	let price = 0;
	if (tripTourPackageId) {
		price = await ReservationPrice(null, seatIds, tripTourPackageId);
		trainClass = await getTrainClass(null, tripTourPackageId);
		if (!trainClass) {
			throw new BadRequestError('Could not determine train class for trip tour package');
		}
	} else if (tripId) {
		trainClass = await getTrainClass(tripId, null);
		if (!trainClass) {
			throw new BadRequestError('Could not determine train class for trip');
		}
		price = await ReservationPrice(tripId, seatIds, null);
	}
	let pointsUsed = 0;
	let discount = 0;
	if (redemptionType === 'partial_discount' && pointsToRedeem && pointsToRedeem > 0) {
		console.log('Calculating partial discount with points:', pointsToRedeem);
		console.log('User points:', user.points);
		if (pointsToRedeem > user.points) {
			throw new BadRequestError('Insufficient points for partial discount');
		}
		const result = calculatePartialDiscount(pointsToRedeem, user.points);
		console.log('Partial discount result:', result);
		pointsUsed = result.pointsUsed;
		discount = result.discount;
		if (discount > price || discount === price) {
			throw new BadRequestError('Discount exceeds the total price or equals it and cannot be applied fully');
		}
		price = price - discount;
		console.log('Discount applied:', discount, 'Points used:', pointsUsed, 'New price:', price);
	}
	else if (redemptionType === 'full_discount') {
		const trainClass = await getTrainClass(tripId, tripTourPackageId);
		if (!trainClass) {
			throw new BadRequestError('Could not determine train class for full redemption');
		}

		const requiredPoints = fullRedemptionPointsCost[trainClass];
		if (!requiredPoints) {
			throw new BadRequestError('Full redemption not available for this train class');
		}

		if (user.points < requiredPoints) {
			throw new BadRequestError('Insufficient points for full redemption');
		}

		pointsUsed = requiredPoints;
		price = 0;

		console.log(`Full redemption for class ${trainClass} with ${pointsUsed} points`);

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

	const tickets = await createTicket(reservation, seatIds);
	console.log('Tickets created:', tickets);
	if (!tickets || tickets.length === 0) {
		throw new DatabaseError('Failed to create tickets for the reservation');
	}
	if (redemptionType === 'full_discount'){
		if(user.points < pointsUsed) {
			throw new BadRequestError('Insufficient points for full redemption');
		}
		await reducePoints(userId, pointsUsed);
		console.log(`Reduced ${pointsUsed} points from user ${userId} for full redemption`);
		reservationStatusUpdate(reservation.id, 'CONFIRMED');
		console.log(`Reservation ${reservation.id} status updated to CONFIRMED`);
		for (const ticket of tickets) {
			await updateTicketStatus(ticket.id, 'RESERVED');
			console.log(`Ticket ${ticket.id} status updated to RESERVED`);
		}
		return res.status(201).json({ reservation, tickets, pointsUsed, discount });
		
	}
	const amountInCents = Math.round(price * 100);
	const paymentResponse = await initiatePayment(amountInCents, user);
	if (!paymentResponse || !paymentResponse.client_secret) {
		throw new PaymentError('Payment initiation failed');
	}
	console.log("ammountInCents", amountInCents);
	const payment = await createPayment(amountInCents / 100, reservation.id, userId, paymentResponse.intention_order_id, pointsUsed );
	const paymentUrl = await paymentGateway(paymentResponse);
	if (!paymentUrl) {
		throw new PaymentError('Payment URL generation failed');
	}



	res.status(201).json({ paymentResponse, paymentUrl });
};

module.exports = {
	makeReservation,
};
