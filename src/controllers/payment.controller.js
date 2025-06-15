const { initiatePayment } = require('../services/payment.services')
const { updateTicketStatus, deleteTicket } = require('../services/ticket.services');
const prisma = require('../config/prisma/client');
const { reservationStatusUpdate, deleteReservation } = require('../services/reservation.services');
const { updatePaymentStatus, getFailedPayment, deletePayment, getPaymentByUserId } = require('../services/payment.services');
const { PaymentError } = require('../utils/errorTypes.utils');
const {
	calculatePoints,
	getUserLoyaltyPoints,
	addLoyaltyPoints,
	getSeatsIds,
	reducePoints
} = require('../services/loyality.services');
const { de } = require('@faker-js/faker');


const statusController = async (req, res) => {
	const orderId = JSON.stringify(req.body.obj?.payment_key_claims?.order_id);
	if (!orderId) throw new PaymentError('Order ID missing from Paymob payload');

	if (req.body.obj.success === true) {
		const updatedPayment = await updatePaymentStatus(orderId, 'COMPLETED');
		if (!updatedPayment) {
			throw new PaymentError('Failed to update payment status');
		}

		const updatedReservation = await reservationStatusUpdate(updatedPayment.reservationId, 'CONFIRMED');
		if (!updatedReservation) {
			throw new PaymentError('Failed to update reservation status');
		}
		if (!updatedReservation.tickets || updatedReservation.tickets.length === 0) {
			throw new PaymentError('No tickets found for the reservation');
		}

		for (const ticket of updatedReservation.tickets) {
			await updateTicketStatus(ticket.id, 'RESERVED');
		}
		const seatIds = await getSeatsIds(updatedReservation);
		if (!seatIds || seatIds.length === 0) {
			throw new PaymentError('Fuclllllllllllllllllllllll');
		}
		const points = await calculatePoints(updatedReservation, seatIds);
		if (points > 0) {
			const userPoints = await getUserLoyaltyPoints(updatedReservation.userId);
			const newPoints = await addLoyaltyPoints(updatedReservation.userId, points);
			console.log(`User ${updatedReservation.userId} has have ${userPoints} has been awarded ${points} points. Total points: ${newPoints}`);
		}
		if (updatedPayment.pointsToRedeem > 0) {
			const userPoints = await getUserLoyaltyPoints(updatedReservation.userId);
			const newPoints = await reducePoints(updatedReservation.userId, updatedPayment.pointsToRedeem);
			console.log(`User ${updatedReservation.userId} has redeemed ${updatedPayment.pointsToRedeem} points. Total points: ${newPoints}`);
		}
		res.redirect("http://localhost:5173")
	} else {
		const failedPayment = await getFailedPayment(orderId);
		if (failedPayment?.reservation?.tickets) {
			for (const ticket of failedPayment.reservation.tickets) {
				await deleteTicket(ticket.id);
			}
		}

		await updatePaymentStatus(orderId, 'FAILED');
		await reservationStatusUpdate(failedPayment.reservationId, 'CANCELED');
		await deletePayment(orderId);
		await deleteReservation(failedPayment.reservationId);
		throw new PaymentError('Payment failed, reservation and tickets deleted');
	}

	res.redirect("http://localhost:5173");
};


const redirectController = async (req, res) => {

	res.redirect("http://localhost:5173");
}

const userPaymentsController = async (req, res) => {
	const userId = req.user.id;
	if (!userId) {
		throw new PaymentError('User ID is required');
	}

	const payments = await getPaymentByUserId(userId);
	if (!payments || payments.length === 0) {
		return res.status(404).json({ message: 'No payments found for this user' });
	}

	return res.status(200).json(payments);
}

module.exports = {
	statusController,
	redirectController,
	userPaymentsController
}
