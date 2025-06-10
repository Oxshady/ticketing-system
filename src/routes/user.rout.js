const {	userProfile,
	userUpdate,
	deleteProfile} = require('../controllers/user.controllers');
	const catchAsync = require('../utils/asyncWrapper.utils');
const userRouter = require('express').Router();
const {userPaymentsController } = require('../controllers/payment.controller');
const {getReservationOfUserController} = require('../controllers/reservation.controller');
const { getTicketByUserIdController } = require('../controllers/ticket.controller');
const { authorizationMiddleware } = require('../middlewares/authorization.middleware');
const { use } = require('passport');

userRouter.get('/profile', authorizationMiddleware, catchAsync(userProfile));
userRouter.get('/payments', authorizationMiddleware, catchAsync(userPaymentsController));
userRouter.get('/reservations', authorizationMiddleware, catchAsync(getReservationOfUserController));
userRouter.get('/tickets', authorizationMiddleware, catchAsync(getTicketByUserIdController));

userRouter.put('/profile', authorizationMiddleware, catchAsync(userUpdate));
userRouter.delete('/profile', authorizationMiddleware, catchAsync(deleteProfile));


module.exports = {
	userRouter
};