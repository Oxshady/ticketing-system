const {PrismaClient} = require('@prisma/client')

const prisma = new PrismaClient().$extends({
	name: 'UserXorValidation',
	query: {
		user: {
			create({ args, query }) {
				const { password, googleId } = args.data;
				if ((password && googleId) || (!password && !googleId)) {
					throw new Error('User must have either a password or a Google ID, but not both.');
				}
				return query(args);
			}
		}
	}
});

module.exports = prisma