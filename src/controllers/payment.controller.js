const { initiatePayment } = require('../services/payment.services')
const { updateTicketStatus, deleteTicket } = require('../services/ticket.services');
const prisma = require('../config/prisma/client');
const { de } = require('@faker-js/faker');

const statusController = async (req, res) => {
	const orderId = JSON.stringify(req.body.obj?.payment_key_claims?.order_id);
	if (!orderId) throw new PaymentError('Order ID missing from Paymob payload');

	if (req.body.obj.success === true) {
		const updatedPayment = await prisma.payment.update({
			where: { paymobOrderId: orderId },
			data: { status: 'COMPLETED' },
		});

		const updatedReservation = await prisma.reservation.update({
			where: { id: updatedPayment.reservationId },
			data: { status: 'CONFIRMED' },
			include: { tickets: true },
		});

		for (const ticket of updatedReservation.tickets) {
			await updateTicketStatus(ticket.id, 'RESERVED');
		}
	} else {
		const failedPayment = await prisma.payment.findUnique({
			where: { paymobOrderId: orderId },
			include: {
				reservation: {
					include: { tickets: true },
				},
			},
		});

		if (failedPayment?.reservation?.tickets) {
			for (const ticket of failedPayment.reservation.tickets) {
				await deleteTicket(ticket.id);
			}
		}

		await prisma.payment.update({
			where: { paymobOrderId: orderId },
			data: { status: 'FAILED' },
		});
	}

	res.sendStatus(200);
};


const redirectController = async (req, res) => {
	res.json({reqbody: req.body, reqquery: req.query, reqparams: req.params});
}

module.exports = {
	statusController,
	redirectController
}
