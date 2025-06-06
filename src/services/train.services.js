const prisma = require('../config/prisma/client');

const getTrainClass = async(tripId, tripTourPackageId) => {
	if (tripTourPackageId) {
		const tripTourPackage = await prisma.tripTourPackage.findUnique({
			where: { id: tripTourPackageId },
			include: {
				trip: {
					include: {
						train: {
							select: { type: true },
						},
					},
				},
			},
		})
		return tripTourPackage?.trip?.train?.type;
	}
		else if (tripId) {
		const trip = await prisma.trip.findUnique({
			where: { id: tripId },
			include: {
				train: {
					select: { type: true },
				},
			},
		})
		return trip?.train?.type;
	}
}


module.exports = {
	getTrainClass,
};