const { AppError } = require('../utils/errorHandler.utils');
const { PrismaClientKnownRequestError, PrismaClientValidationError } = require('@prisma/client');

const handlePrismaError = (error) => {
	if (error instanceof PrismaClientKnownRequestError) {
		switch (error.code) {
			case 'P2002':
				return new AppError(`Duplicate entry: already exists`, 409);
			case 'P2025':
				return new AppError('Record not found', 404);
			case 'P2003':
				return new AppError('Foreign key constraint failed', 400);
			case 'P2014':
				return new AppError('Invalid ID provided', 400);
			default:
				return new AppError('Database error occurred', 500);
		}
	}

	if (error instanceof PrismaClientValidationError) {
		return new AppError('Invalid data provided', 400);
	}

	return new AppError('Internal server error', 500);
};

const handleJWTError = () => new AppError('Invalid token. Please log in again', 401);
const handleJWTExpiredError = () => new AppError('Token expired. Please log in again', 401);

const sendErrorDev = (err, res) => {
	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
		...(err.details && { details: err.details }),
		...(err.paymentDetails && { paymentDetails: err.paymentDetails }),
		...(err.reservationId && { reservationId: err.reservationId }),
		...(err.seatIds && { seatIds: err.seatIds })
	});
};

const sendErrorProd = (err, res) => {
	if (err.isOperational) {
		const response = {
			status: err.status,
			message: err.message
		};

		if (err.name === 'ValidationError' && err.details) {
			response.details = err.details;
		}

		if (err.name === 'SeatUnavailableError' && err.seatIds) {
			response.unavailableSeats = err.seatIds;
		}
		if (err.name === 'ReservationError' && err.reservationId) {
			response.reservationId = err.reservationId;
		}
		if (err.name === 'PaymentError' && err.paymentDetails) {
			response.paymentDetails = err.paymentDetails;
		}
		res.status(err.statusCode).json(response);
	} else {
		console.error('ERROR 💥', err);
		res.status(500).json({
			status: 'error',
			message: 'Something went wrong!'
		});
	}
};

module.exports = {
	sendErrorDev,
	sendErrorProd,
	handlePrismaError,
	handleJWTError,
	handleJWTExpiredError
};