const adminRouter = require('express').Router();
const catchAsync = require('../utils/asyncWrapper.utils');
const { authorizationMiddleware, adminOnly } = require('../middlewares/authorization.middleware');
const {
    getAllUsers,
    getUserById,
    updateUser,
    deleteUserById,
    createNewUser,
    getAllTrips,
    getTripById,
    updateTripById,
    deleteTripById,
    createNewTrip,
    getAllTripTourPackages,
    getTripTourPackageById,
    updateTripTourPackageById,
    deleteTripTourPackageById,
    createNewTripTourPackage,
    getAllReservations,
    getReservation,
    deleteReservationById,
    createNewReservation,
    updateReservationStatus
} = require('../controllers/admin.controllers');


adminRouter.use(authorizationMiddleware);
adminRouter.use(adminOnly);

adminRouter.get('/users', catchAsync(getAllUsers));
adminRouter.post('/user', catchAsync(getUserById));
adminRouter.put('/user', catchAsync(updateUser));
adminRouter.delete('/user', catchAsync(deleteUserById));
adminRouter.post('/user', catchAsync(createNewUser));

adminRouter.get('/trips', catchAsync(getAllTrips));
adminRouter.post('/trip', catchAsync(getTripById));
adminRouter.put('/trip', catchAsync(updateTripById));
adminRouter.delete('/trip', catchAsync(deleteTripById));
adminRouter.post('/trip', catchAsync(createNewTrip));

adminRouter.get('/trip-tour-packages', catchAsync(getAllTripTourPackages));
adminRouter.post('/trip-tour-package', catchAsync(getTripTourPackageById));
adminRouter.put('/trip-tour-package', catchAsync(updateTripTourPackageById));
adminRouter.delete('/trip-tour-package', catchAsync(deleteTripTourPackageById));
adminRouter.post('/trip-tour-package', catchAsync(createNewTripTourPackage));

adminRouter.get('/reservations', catchAsync(getAllReservations));
adminRouter.post('/reservation', catchAsync(getReservation));
adminRouter.delete('/reservation', catchAsync(deleteReservationById));
adminRouter.post('/reservation', catchAsync(createNewReservation));
adminRouter.put('/reservation-status', catchAsync(updateReservationStatus));

module.exports = {adminRouter};