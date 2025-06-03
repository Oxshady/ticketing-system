const { da } = require('@faker-js/faker');
const fetch = require('node-fetch');
const uuidv4 = require('uuid');
/**
 * Initiates a payment request to the Paymob API.
 * 
 * @param {number} amount - The amount to be charged in the smallest currency unit (e.g., cents).
 */

const initiatePayment = async (amount, quantity, user) => {
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
			"first_name": "ali",
			"last_name": "zain",
			"street": 'dumy',
			"building": 'dumy',
			"phone_number": "01000000000",
			"city": 'dumy',
			"country": "dumy",
			"email": "fake@gmail.com",
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
	console.log(data)
	return data;
}

module.exports = {
	initiatePayment
};