const adminEmails = process.env.ADMIN_EMAILS.split(',');

const isAdmin = (user) => {
	return adminEmails.includes(user.email);
}

module.exports = {
	isAdmin
};