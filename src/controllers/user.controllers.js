const { getUser, updateData, deleteUser } = require('../services/user.services');

const userProfile = async (req, res) => {
	const userId = req.user.id;
	console.log('User ID:', userId);
	const user = await getUser(userId);
	console.log(user);
	if (!user) {
		return res.status(404).json({ message: 'User not found' });
	}
	res.status(200).json(user);
};

const userUpdate = async (req, res) => {
	const { firstName, lastName, email } = req.body;
	const userId = req.user.id;
	if (!firstName && !lastName && !email) {
		return res.status(400).json({ message: 'At least one field (firstName, lastName, email) is required for update' });
	}
	const updatedUser = await updateData(userId, { firstName, lastName, email });
	res.status(200).json({
		message: 'User updated successfully',
		data: updatedUser,
	});
};

const deleteProfile = async (req, res) => {
	const userId = req.user.id;
	const deletedUser = await deleteUser(userId);
	if (!deletedUser) {
		return res.status(404).json({ message: 'User not found or could not be deleted' });
	}
	res.status(200).json({
		message: 'User deleted successfully',
		data: deletedUser,
	});
};

module.exports = {
	userProfile,
	userUpdate,
	deleteProfile
};