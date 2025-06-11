const { verifyToken } = require('../utils/jwtHelper.utils');
const { isAdmin } = require('../utils/admin.utils');
const authorizationMiddleware = async (req, res, next) => {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Access denied. No token provided.' });
		}

		const token = authHeader.split(' ')[1];
		const decoded = await verifyToken(token);
		if (!decoded || !decoded.id) {
			return res.status(401).json({ message: 'Access denied. Invalid token.' });
		}

		req.user = decoded;
		next();
	} catch (error) {
		console.error('Authorization error:', error.message);
		return res.status(401).json({ message: 'Access denied. Invalid or expired token.' });
	}
};

const adminOnly = (req, res, next) => {
  if (!req.user || !isAdmin(req.user)) {
    return res.status(403).json({ message: 'Admins only' });
  }
  next();
};


module.exports = {authorizationMiddleware, adminOnly};