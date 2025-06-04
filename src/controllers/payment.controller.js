const { initiatePayment } = require('../services/payment.services')
const { updateTicketStatus, deleteTicket } = require('../services/ticket.services');
const prisma = require('../config/prisma/client');
const { de } = require('@faker-js/faker');
const initiateController = async (req, res) => {
	const { amount , quantity} = req.body;

	try {
		const paymentResponse = await initiatePayment(amount, quantity);
		let url = new URL(process.env.PAYMOB_CHECKOUT_URL);
		url.searchParams.append('publicKey', process.env.PAYMOB_PUBLIC_KEY);
		url.searchParams.append('clientSecret', paymentResponse.client_secret);
		res.json({ url: url.toString() });
	} catch (error) {
		console.error('Payment initiation failed:', error);
		res.status(500).json({ error: 'Payment initiation failed' });
	}
}

const statusController = async (req, res) => {
	try {
		if (req.body.obj.success === true) {
			const updatedPayment = await prisma.payment.update({
				where: {
					paymobOrderId: JSON.stringify(req.body.obj.payment_key_claims.order_id),
				},
				data: { status: 'COMPLETED' },
			});

			console.log('Payment completed successfully');
			console.log(JSON.stringify(updatedPayment));

			const updatedReservation = await prisma.reservation.update({
				where: { id: updatedPayment.reservationId },
				data: { status: 'CONFIRMED' },
				include: { tickets: true },
			});

			console.log('Reservation updated successfully');

			for (const ticket of updatedReservation.tickets) {
				await updateTicketStatus(ticket.id, 'RESERVED');
			}

			console.log('Tickets updated successfully');
		} else {
			const failedPayment = await prisma.payment.findUnique({
				where: {
					paymobOrderId: JSON.stringify(req.body.obj.payment_key_claims.order_id),
				},
				include: {
					reservation: {
						include: {
							tickets: true,
						},
					},
				},
			});

			if (failedPayment?.reservation) {
				// Delete all related tickets
				for (const ticket of failedPayment.reservation.tickets) {
					await deleteTicket(ticket.id);
				}
			}

			// Optionally update payment status
			await prisma.payment.update({
				where: {
					paymobOrderId: JSON.stringify(req.body.obj.payment_key_claims.order_id),
				},
				data: { status: 'FAILED' },
			});

			console.log('Payment failed. Reservation and tickets deleted.');
		}

		res.sendStatus(200);
	} catch (err) {
		console.error('Error handling payment status:', err);
		res.status(500).json({ error: 'Error handling payment status' });
	}
};


const redirectController = async (req, res) => {
	const { status } = req.query;
	if (status === 'success') {
		res.json({ message: 'Payment successful' });
	} else {
		res.json({ message: 'Payment failed' });
	}
}

module.exports = {
	initiateController
	,statusController,
	redirectController
}
