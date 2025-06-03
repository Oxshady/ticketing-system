const { initiatePayment } = require('../utils/payment.utils')

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

	console.log(req);
}

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
