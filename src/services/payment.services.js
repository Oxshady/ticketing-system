const { da } = require('@faker-js/faker');
const prisma = require('../config/prisma/client');
const fetch = require('node-fetch');
const { use } = require('passport');
const uuidv4 = require('uuid');



const initiatePayment = async (amount, user) => {
	let myHeaders = new Headers();
	myHeaders.append("Authorization", `Token ${process.env.PAYMOB_SECRET_KEY}`);
	myHeaders.append("Content-Type", "application/json");
	let raw = JSON.stringify({
		"amount": amount,
		"currency": "EGP",
		"payment_methods": [
			Number(process.env.PAYMOB_INTEGRATION_ID)
		],
		"items": [
			{
				"name": "TRIP",
				"amount": amount,
				"description": "TRAIN TICKET",
				"quantity": 1
			}
		],
		"billing_data": {
			"apartment": "dumy",
			"first_name": user.firstName,
			"last_name": user.lastName,
			"street": 'dumy',
			"building": 'dumy',
			"phone_number": "01000000000",
			"city": 'dumy',
			"country": "dumy",
			"email": user.email,
			"floor": "dumy",
			"state": "dumy"
		},
		"extras": {
			"ee": 22
		},
		"special_reference": uuidv4.v4(),
		"expiration": 3600
	});

	let requestOptions = {
		method: 'POST',
		headers: myHeaders,
		body: raw,
		redirect: 'follow'
	};


	let data = await fetch(process.env.PAYMOB_INITIATE_URL, requestOptions)
	data = await data.json()
	return data;
}


const paymentGateway = async (paymentResponse) => {
	try {
		let url = new URL(process.env.PAYMOB_CHECKOUT_URL);
		url.searchParams.append('publicKey', process.env.PAYMOB_PUBLIC_KEY);
		url.searchParams.append('clientSecret', paymentResponse.client_secret);
		return url.toString();
	} catch (error) {
		throw new Error('Payment initiation failed');
	}
}

const createPayment = async (price, reservationId, userId, paymobOrderId) => {
	const payment = await prisma.payment.create({
		data: {
			amount: price,
			reservationId: reservationId,
			userId: userId,
			paymobOrderId: JSON.stringify(paymobOrderId),
			method: 'CARD',
		}
	});
	if (!payment) {
		throw new Error('Payment creation failed');
	}
	return payment;
}

const updatePaymentStatus = async (orderId, status) => {
	const updatedPayment = await prisma.payment.update({
		where: { paymobOrderId: orderId },
		data: { status: status },
	});
	if (!updatedPayment) {
		throw new Error('Payment update failed');
	}
	return updatedPayment;
}

const getFailedPayment = async (orderId) => {
	const failedPayment = await prisma.payment.findUnique({
		where: { paymobOrderId: orderId },
		include: {
			reservation: {
				include: { tickets: true },
			},
		},
	});
	if (!failedPayment) {
		throw new Error('Failed payment not found');
	}
	return failedPayment;
}

const deletePayment = async (orderId) => {
	const deletedPayment = await prisma.payment.delete({
		where: { paymobOrderId: orderId },
	});
	if (!deletedPayment) {
		throw new Error('Payment deletion failed');
	}
	return deletedPayment;
}

module.exports = {
	initiatePayment,
	paymentGateway,
	createPayment,
	updatePaymentStatus,
	getFailedPayment,
	deletePayment
};