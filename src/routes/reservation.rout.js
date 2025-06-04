const reservation = require('express').Router();
const {ReservationPrice} = require('../utils/reservation.utils');
const {createReservation} = require('../services/reservation.services');
const {initiatePayment,paymentGateway } = require('../services/payment.services');
const prisma = require('../config/prisma/client');
const { use } = require('passport');
reservation.post('/', async(req, res)=>{
	const { userId, tripId, tripTourPackageId, seatIds} = req.body;
	try {
		if ((!tripId && !tripTourPackageId) || !userId || !seatIds || seatIds.length === 0) {
			return res.status(400).json({ error: 'Missing required fields' });
		}
		const price = await ReservationPrice(tripId,seatIds);
		if (price <= 0) {
			return res.status(400).json({ error: 'Invalid seat price' });
		}
		const reservationData = await createReservation(userId, tripId, tripTourPackageId, price);
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { email: true, firstName: true, lastName: true }
		});
		const paymentResponse = await initiatePayment(price * 100, user);
		const paymentUrl = await paymentGateway(paymentResponse);
		if (!paymentUrl) {
			return res.status(500).json({ error: 'Payment initiation failed `url failed`' });
		}
		res.status(201).json({paymentUrl});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
})


module.exports = {
	reservation
};