// src/utils/ErrorTypes.js
const {AppError} = require('./errorHandler.utils');

class ValidationError extends AppError {
	constructor(message = 'Validation failed', details = []) {
		super(message, 400);
		this.name = 'ValidationError';
		this.details = details;
	}
}

class AuthenticationError extends AppError {
	constructor(message = 'Authentication failed') {
		super(message, 401);
		this.name = 'AuthenticationError';
	}
}

class AuthorizationError extends AppError {
	constructor(message = 'Access denied') {
		super(message, 403);
		this.name = 'AuthorizationError';
	}
}

class NotFoundError extends AppError {
	constructor(resource = 'Resource') {
		super(`${resource} not found`, 404);
		this.name = 'NotFoundError';
		this.resource = resource;
	}
}

class ConflictError extends AppError {
	constructor(message = 'Resource already exists') {
		super(message, 409);
		this.name = 'ConflictError';
	}
}

class PaymentError extends AppError {
	constructor(message = 'Payment processing failed', paymentDetails = {}) {
		super(message, 402);
		this.name = 'PaymentError';
		this.paymentDetails = paymentDetails;
	}
}

class ReservationError extends AppError {
	constructor(message = 'Reservation error', reservationId = null) {
		super(message, 422);
		this.name = 'ReservationError';
		this.reservationId = reservationId;
	}
}

class SeatUnavailableError extends AppError {
	constructor(seatIds = []) {
		super('One or more seats are unavailable', 409);
		this.name = 'SeatUnavailableError';
		this.seatIds = seatIds;
	}
}

class DatabaseError extends AppError {
	constructor(message = 'Database operation failed', originalError = null) {
		super(message, 500);
		this.name = 'DatabaseError';
		this.originalError = originalError;
	}
}

class BadRequestError extends AppError {
	constructor(message) {
		super(message, 400);
	}
}

class ExternalServiceError extends AppError {
	constructor(service = 'External service', message = 'Service unavailable') {
		super(`${service}: ${message}`, 503);
		this.name = 'ExternalServiceError';
		this.service = service;
	}
}

module.exports = {
	ValidationError,
	AuthenticationError,
	AuthorizationError,
	NotFoundError,
	ConflictError,
	PaymentError,
	ReservationError,
	SeatUnavailableError,
	DatabaseError,
	ExternalServiceError,
	BadRequestError
};