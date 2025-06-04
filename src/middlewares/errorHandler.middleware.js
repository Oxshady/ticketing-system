const {
	sendErrorDev,
	sendErrorProd,
	handlePrismaError,
	handleJWTError,
	handleJWTExpiredError
} = require('../utils/errorHelper.utils');

const globalErrorHandler = (err, req, res, next) => {
	console.log('hatedddddddddddddddddddddddddddddddddddddddddddddddddddddddddddd')
	err.statusCode = err.statusCode || 500;
	err.status = err.status || 'error';

	if (process.env.NODE_ENV === 'development') {
		sendErrorDev(err, res);
	} else {
		let error = { ...err };
		error.message = err.message;
		error.name = err.name;

		if (err.name === 'PrismaClientKnownRequestError' || err.name === 'PrismaClientValidationError') {
			error = handlePrismaError(err);
		}
		if (err.name === 'JsonWebTokenError') error = handleJWTError();
		if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

		sendErrorProd(error, res);
	}
};
module.exports = {
	globalErrorHandler,
};