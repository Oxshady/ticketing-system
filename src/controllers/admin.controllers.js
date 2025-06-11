const prisma = require('../config/prisma/client');
const { getUser, getUsers, updateData, deleteUser, createUser } = require('../services/user.services');
const {
	getTrips,
	getTripTourPackages,
	getTrip,
	getTripTourPackage,
	createTrip,
	createTripTourPackage,
	updateTrip,
	updateTripTourPackage,
	deleteTrip,
	deleteTripTourPackage
	
} = require('../services/trips.services');


const{	createReservation,
	getReservations,
	getReservationById,
	deleteReservation,reservationStatusUpdate} = require('../services/reservation.services');


const getAllUsers = async (req, res) => {
	try {
		const users = await getUsers();
		res.status(200).json(users);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching users not found' });
	}
};
const getUserById = async (req, res) => {
	const {userId} = req.body;
	try {
		const user = await getUser(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}
		res.status(200).json(user);
	} catch (error) {
		res.status(500).json({ message: 'Error updating user user not found' });
	}
};

const updateUser = async (req, res) => {
	const { userId, firstName, lastName, email } = req.body;
	if (!userId || (!firstName && !lastName && !email)) {
		return res.status(400).json({ message: 'User ID and at least one field (firstName, lastName, email) are required for update' });
	}
	try {
		const updatedUser = await updateData(userId, { firstName, lastName, email });
		res.status(200).json({
			message: 'User updated successfully',
			data: updatedUser,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error updating user user not found' });
	}
}
const deleteUserById = async (req, res) => {
	const { userId } = req.body;
	if (!userId) {
		return res.status(400).json({ message: 'User ID is required for deletion' });
	}
	try {
		const deletedUser = await deleteUser(userId);
		if (!deletedUser) {
			return res.status(404).json({ message: 'User not found or could not be deleted' });
		}
		res.status(200).json({
			message: 'User deleted successfully',
			data: deletedUser,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error deleting user user not found' });
	}
};
const createNewUser = async (req, res) => {
	const { firstName, lastName, email, password } = req.body;
	if (!firstName || !lastName || !email || !password) {
		return res.status(400).json({ message: 'All fields (firstName, lastName, email, password) are required' });
	}
	try {
		const newUser = await createUser(firstName, lastName, email, password);
		res.status(201).json({
			message: 'User created successfully',
			data: newUser.firstName + ' ' + newUser.lastName,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error creating user', error: error.message });
	}
};


const getAllTrips = async (req, res) => {
	try {
		const trips = await getTrips(req.query.page, req.query.limit);
		res.status(200).json(trips);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching trips', error: error.message });
	}
};
const getTripById = async (req, res) => {
	const { tripId } = req.body;
	try {
		const trip = await getTrip(tripId);
		if (!trip) {
			return res.status(404).json({ message: 'Trip not found' });
		}
		res.status(200).json(trip);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching trip', error: error.message });
	}
};
const updateTripById = async (req, res) => {
	const { tripId, data } = req.body;
	if (!tripId || !data) {
		return res.status(400).json({ message: 'Trip ID and data are required for update' });
	}
	try {
		const updatedTrip = await updateTrip(tripId, data);
		res.status(200).json({
			message: 'Trip updated successfully',
			data: updatedTrip,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error updating trip', error: error.message });
	}
};
const deleteTripById = async (req, res) => {
	const { tripId } = req.body;
	if (!tripId) {
		return res.status(400).json({ message: 'Trip ID is required for deletion' });
	}
	try {
		const deletedTrip = await deleteTrip(tripId);
		if (!deletedTrip) {
			return res.status(404).json({ message: 'Trip not found or could not be deleted' });
		}
		res.status(200).json({
			message: 'Trip deleted successfully',
			data: deletedTrip,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error deleting trip', error: error.message });
	}
};
const createNewTrip = async (req, res) => {
	const  data  = req.body;
	console.log(data);
	if (!data) {
		return res.status(400).json({ message: 'All fields (name, description, startDate, endDate) are required' });
	}
	try {
		const newTrip = await createTrip(data);
		res.status(201).json({
			message: 'Trip created successfully',
			data: newTrip,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error creating trip', error: error.message });
	}
};
const getAllTripTourPackages = async (req, res) => {
	try {
		const tripTourPackages = await getTripTourPackages(req.query.page, req.query.limit);
		res.status(200).json(tripTourPackages);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching trip tour packages', error: error.message });
	}
};
const getTripTourPackageById = async (req, res) => {
	const { tripTourPackageId } = req.body;
	try {
		const tripTourPackage = await getTripTourPackage(tripTourPackageId);
		if (!tripTourPackage) {
			return res.status(404).json({ message: 'Trip Tour Package not found' });
		}
		res.status(200).json(tripTourPackage);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching trip tour package', error: error.message });
	}
};
const updateTripTourPackageById = async (req, res) => {
	const { tripTourPackageId, data } = req.body;
	if (!tripTourPackageId || !data) {
		return res.status(400).json({ message: 'Trip Tour Package ID and data are required for update' });
	}
	try {
		const updatedTripTourPackage = await updateTripTourPackage(tripTourPackageId, data);
		res.status(200).json({
			message: 'Trip Tour Package updated successfully',
			data: updatedTripTourPackage,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error updating trip tour package', error: error.message });
	}
};
const deleteTripTourPackageById = async (req, res) => {
	const { tripTourPackageId } = req.body;
	if (!tripTourPackageId) {
		return res.status(400).json({ message: 'Trip Tour Package ID is required for deletion' });
	}
	try {
		const deletedTripTourPackage = await deleteTripTourPackage(tripTourPackageId);
		if (!deletedTripTourPackage) {
			return res.status(404).json({ message: 'Trip Tour Package not found or could not be deleted' });
		}
		res.status(200).json({
			message: 'Trip Tour Package deleted successfully',
			data: deletedTripTourPackage,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error deleting trip tour package', error: error.message });
	}
};
const createNewTripTourPackage = async (req, res) => {
	const { tripId, name, description, price } = req.body;
	if (!tripId || !name || !description || !price) {
		return res.status(400).json({ message: 'All fields (tripId, name, description, price) are required' });
	}
	try {
		const newTripTourPackage = await createTripTourPackage({ tripId, name, description, price });
		res.status(201).json({
			message: 'Trip Tour Package created successfully',
			data: newTripTourPackage,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error creating trip tour package', error: error.message });
	}
};

const getAllReservations = async (req, res) => {
	try {
		const reservations = await getReservations();
		res.status(200).json(reservations);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching reservations', error: error.message });
	}
};
const getReservation = async (req, res) => {
	const { reservationId } = req.body;
	try {
		const reservation = await getReservationById(reservationId);
		if (!reservation) {
			return res.status(404).json({ message: 'Reservation not found' });
		}
		res.status(200).json(reservation);
	} catch (error) {
		res.status(500).json({ message: 'Error fetching reservation', error: error.message });
	}
};
const deleteReservationById = async (req, res) => {
	const { reservationId } = req.body;
	if (!reservationId) {
		return res.status(400).json({ message: 'Reservation ID is required for deletion' });
	}
	try {
		const deletedReservation = await deleteReservation(reservationId);
		if (!deletedReservation) {
			return res.status(404).json({ message: 'Reservation not found or could not be deleted' });
		}
		res.status(200).json({
			message: 'Reservation deleted successfully',
			data: deletedReservation,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error deleting reservation', error: error.message });
	}
};
const createNewReservation = async (req, res) => {
	const { userId, tripId, tripTourPackageId, price } = req.body;
	if (!userId || (!tripId && !tripTourPackageId)) {
		return res.status(400).json({ message: 'User ID, Trip ID, and Trip Tour Package ID are required to create a reservation.' });
	}
	try {
		
		const newReservation = await createReservation(userId, tripId, tripTourPackageId, price );
		console.log(tripId)
		res.status(201).json({
			message: 'Reservation created successfully',
			data: newReservation,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error creating reservation', error: error.message });
	}
};

const updateReservationStatus = async (req, res) => {
	const { reservationId, status } = req.body;
	if (!reservationId || !status) {
		return res.status(400).json({ message: 'Reservation ID and status are required for update' });
	}
	try {
		const updatedReservation = await reservationStatusUpdate(reservationId, status);
		res.status(200).json({
			message: 'Reservation status updated successfully',
			data: updatedReservation,
		});
	} catch (error) {
		res.status(500).json({ message: 'Error updating reservation status', error: error.message });
	}
};




module.exports = {
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
};