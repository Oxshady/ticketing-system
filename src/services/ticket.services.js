const prisma = require('../config/prisma/client');

const createTicket = async (reservation, seatIds) => {
	if(!reservation || !seatIds || seatIds.length === 0) {
		throw new Error('Invalid reservation or seat IDs');
	}
	const tripId = reservation.tripId || reservation.tripTourPackageId;
	const tickets = await prisma.ticket.createMany({
		data: seatIds.map(seatId => ({
			reservationId: reservation.id,
			seatId,
			tripId,
		})),
	});
	return tickets;

}

const getTicketsByReservationId = async (reservationId) => {
	if (!reservationId) {
		throw new Error('Reservation ID is required');
	}
	const tickets = await prisma.ticket.findMany({
		where: {
			reservationId,
		},
		include: {
			seat: true,
			trip: true,
		},
	});
	return tickets;
}


const getTicketById = async (id) => {
	if (!id) {
		throw new Error('Ticket ID is required');
	}
	const ticket = await prisma.ticket.findUnique({
		where: {
			id,
		},
		include: {
			seat: true,
			trip: true,
			reservation: true,
		},
	});
	return ticket;
};

const deleteTicket = async (id) => {
	if (!id) {
		throw new Error('Ticket ID is required');
	}
	const deletedTicket = await prisma.ticket.delete({
		where: {
			id,
		},
	});
	return deletedTicket;
};

const getTicketsByUserId = async (userId) => {
	if (!userId) {
		throw new Error('User ID is required');
	}
	const tickets = await prisma.ticket.findMany({
		where: {
			reservation: {
				userId,
			},
		},
		include: {
			seat: true,
			trip: true,
			reservation: true,
		},
	});
	return tickets;
};

const getTicketsByTripId = async (tripId) => {
	if (!tripId) {
		throw new Error('Trip ID is required');
	}
	const tickets = await prisma.ticket.findMany({
		where: {
			tripId,
		},
		include: {
			seat: true,
			reservation: true,
		},
	});
	return tickets;
};

const getTicketsBySeatId = async (seatId) => {
	if (!seatId) {
		throw new Error('Seat ID is required');
	}
	const tickets = await prisma.ticket.findMany({
		where: {
			seatId,
		},
		include: {
			reservation: true,
			trip: true,
		},
	});
	return tickets;
};

const updateTicketStatus = async (id, status) => {
	if (!id || !status) {
		throw new Error('Ticket ID and status are required');
	}
	const updatedTicket = await prisma.ticket.update({
		where: {
			id,
		},
		data: {
			status,
		},
	});
	return updatedTicket;
};

module.exports = {
	createTicket,
	getTicketsByReservationId,
	getTicketById,
	deleteTicket,
	getTicketsByUserId,
	getTicketsByTripId,
	getTicketsBySeatId,
	updateTicketStatus
}