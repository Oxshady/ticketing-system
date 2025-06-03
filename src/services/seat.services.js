const prisma = require('../config/prisma/client');

const getAvailableSeats = async (trainId) => {
	const seats = await prisma.seat.findMany({
		where: {
			trainId: trainId,
			status: 'Available',
		},
	});
	return seats;
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

const updateSeatStatus = async (id, status) => {
	const updatedSeat = await prisma.seat.update({
		where: {
			id: id,
		},
		data: {
			status: status,
		},
	});
	return updatedSeat;
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

const getSeatStatus = async (id) => {
	const seat = await prisma.seat.findUnique({
		where: {
			id: id,
		},
		select: {
			status: true,
		},
	});
	return seat ? seat.status : null;
};

module.exports = {
	getAvailableSeats,
	getSeatById,
	updateSeatStatus,
	createSeat,
	deleteSeat,
	getSeatStatus,
	getSeatBySeatNumber
};