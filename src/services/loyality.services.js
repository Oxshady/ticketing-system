const prisma = require('../config/prisma/client');

const POINTS_PER_CLASS = {
	ECONOMY: 10,
	BUSINESS: 25,
	FIRST_CLASS: 50,
};


const getUserLoyaltyPoints = async (userId) => {
	const user = await prisma.user.findUnique({
		where: { id: userId },
		select: { points: true },
	});

	if (!user) throw new Error('User not found');

	return user.points || 0;
};

const addLoyaltyPoints = async (userId, points) => {
	if (points <= 0) throw new Error('Points must be greater than zero');
	const user = await prisma.user.findUnique({
		where: { id: userId },
	});
	if (!user) throw new Error('User not found');
	await prisma.user.update({
		where: { id: userId },
		data: { points: { increment: points } },
	});
	return await getUserLoyaltyPoints(userId);
};


const awardLoyaltyPointsOnReservation = async (reservationId) => {
	const reservation = await prisma.reservation.findUnique({
		where: { id: reservationId },
		include: {
			tickets: {
				include: { seat: true }
			},
			user: true,
		},
	});

	if (!reservation) throw new Error('Reservation not found');

	let totalPoints = 0;
	for (const ticket of reservation.tickets) {
		const seatClass = ticket.seat.class;
		totalPoints += POINTS_PER_CLASS[seatClass] || 0;
	}

	await prisma.user.update({
		where: { id: reservation.userId },
		data: { points: { increment: totalPoints } },
	});
};


module.exports = {
	awardLoyaltyPointsOnReservation,
};