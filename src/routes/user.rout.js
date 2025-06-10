const {	userProfile,
	userUpdate,
	deleteProfile} = require('../controllers/user.controllers');
	const catchAsync = require('../utils/asyncWrapper.utils');
const userRouter = require('express').Router();
const { authorizationMiddleware } = require('../middlewares/authorization.middleware');

userRouter.get('/profile', authorizationMiddleware, catchAsync(userProfile));
userRouter.put('/profile', authorizationMiddleware, catchAsync(userUpdate));
userRouter.delete('/profile', authorizationMiddleware, catchAsync(deleteProfile));


module.exports = {
	userRouter
};