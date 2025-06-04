const prisma = require('../config/prisma/client');

const getAvailableSeats = async (trip) => {
	const availableSeats = await prisma.seat.findMany({
		where: {
			trainId: trip.trainId,
			tickets: {
				none: {
					tripId: trip.id,
				},
			},
		},
	});
	return availableSeats
}


const getSeatById = async (id) => {
	const seat = await prisma.seat.findUnique({
		where: {
			id: id,
		},
	});
	return seat;
};

const getSeatBySeatNumber = async (trainId, seatNumber) => {
	const seat = await prisma.seat.findFirst({
		where: {
			trainId: trainId,
			seatNumber: seatNumber,
		},
	});
	return seat;
};

const createSeat = async (seatData) => {
	const newSeat = await prisma.seat.create({
		data: seatData,
	});
	return newSeat;
};

const deleteSeat = async (id) => {
	const deletedSeat = await prisma.seat.delete({
		where: {
			id: id,
		},
	});
	return deletedSeat;
};


module.exports = {
	getAvailableSeats,
	getSeatById,
	createSeat,
	deleteSeat,
	getSeatBySeatNumber
};