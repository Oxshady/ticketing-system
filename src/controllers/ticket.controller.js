const {getTicketsByReservationId, getTicketsByUserId} = require('../services/ticket.services');
const { BadRequestError } = require('../utils/errorTypes.utils');

const getTicketsByReservationController = async (req, res) => {
	const { reservationId } = req.body;

	if (!reservationId) {
		throw new BadRequestError('Reservation ID is required');
	}

	const tickets = await getTicketsByReservationId(reservationId);

	if (!tickets || tickets.length === 0) {
		return res.status(404).json({ message: 'No tickets found for this reservation' });
	}

	return res.status(200).json(tickets);
}

const getTicketByUserIdController = async (req, res) => {
	const userId = req.user.id;

	if (!userId) {
		throw new BadRequestError('User ID is required');
	}

	const tickets = await getTicketsByUserId(userId);

	if (!tickets || tickets.length === 0) {
		return res.status(404).json({ message: 'No tickets found for this user' });
	}

	return res.status(200).json(tickets);
}

module.exports = {
	getTicketsByReservationController,
	getTicketByUserIdController
};