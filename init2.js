import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
	// Clear old data (optional)
	await prisma.payment.deleteMany({});
	await prisma.ticket.deleteMany({});
	await prisma.reservation.deleteMany({});
	await prisma.seat.deleteMany({});
	await prisma.tripPackage.deleteMany({});
	await prisma.tourPackage.deleteMany({});
	await prisma.tourCompany.deleteMany({});
	await prisma.trip.deleteMany({});
	await prisma.train.deleteMany({});
	await prisma.feedback.deleteMany({});
	await prisma.user.deleteMany({});

	// Create Users
	const users = [];
	for (let i = 0; i < 5; i++) {
		const user = await prisma.user.create({
			
			data: {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				email: faker.internet.email(),
				password: faker.internet.password(),
			},
		});
		users.push(user);
	}

	// Create TourCompanies and TourPackages
	const companies = [];
	for (let i = 0; i < 3; i++) {
		const company = await prisma.tourCompany.create({
			data: {
				name: faker.company.name(),
				email: faker.internet.email(),
				tourPackage: {
					create: [
						{
							name: `Package A${i}`,
							description: faker.lorem.sentence(),
							price: parseFloat(faker.commerce.price(100, 1000)),
							duration: `22 days`,
						},
						{
							name: `Package B${i}`,
							description: faker.lorem.sentence(),
							price: parseFloat(faker.commerce.price(100, 1000)),
							duration: `22 days`,
						},
					],
				},
			},
			include: { tourPackage: true },
		});
		companies.push(company);
	}

	// Create Trains and Seats
	const trains = [];
	for (let i = 0; i < 3; i++) {
		const train = await prisma.train.create({
			data: {
				name: `Train-${i + 1}`,
				capacity: 10,
				type: faker.helpers.arrayElement(['Express', 'Local']),
				status: 'active',
				seat: {
					create: Array.from({ length: 10 }).map((_, idx) => ({
						seatNumber: idx + 1,
						class: faker.helpers.arrayElement(['Economy', 'Business']),
						status: 'available',
					})),
				},
			},
			include: { seat: true },
		});
		trains.push(train);
	}

	// Create Trips linked to Trains
	const trips = [];
	for (let i = 0; i < 5; i++) {
		const dep = faker.date.soon(10);
		const arr = new Date(dep.getTime() + 22 * 60000); // dep + 1-5 hrs
		const trip = await prisma.trip.create({
			data: {
				deppartual: dep,
				arrival: arr,
				frequency: faker.helpers.arrayElement(['Daily', 'Weekly']),
				source: faker.location.city(),
				destination: faker.location.city(),
				stationLocation: faker.location.streetAddress(),
				trainId: trains[i % trains.length].id,
			
			},
		});
		trips.push(trip);
	}

	// Create TripPackages linking Trips and TourPackages
	const tripPackages = [];
	for (const trip of trips) {
		for (const company of companies) {
			for (const tpkg of company.tourPackage) {
				const tripPkg = await prisma.tripPackage.create({
					data: {
						tripId: trip.id,
						tourPackageId: tpkg.id,
					},
				});
				tripPackages.push(tripPkg);
			}
		}
	}

	// Create Reservations with Tickets and Payments
	for (let i = 0; i < 10; i++) {
		// Pick random user and tripPackage
		const user = users[i % users.length];
		const tripPackage = tripPackages[i % tripPackages.length];
		const trip = trips.find(t => t.id === tripPackage.tripId);
		const train = trains.find(t => t.id === trip?.trainId);

		// Create Reservation
		const reservation = await prisma.reservation.create({
			data: {
				status: faker.helpers.arrayElement(['pending', 'confirmed', 'cancelled']),
				userId: user.id,
				tripId: trip?.id,
				tripPackageTripId: tripPackage.tripId,
				tripPackageTourPackageId: tripPackage.tourPackageId,
			},
		});

		// Create Ticket(s) - 1 or 2 tickets per reservation, linked to seats on the train
		for (let j = 0; j < 22; j++) {
			const seat = train?.seat[j]; // assign seat
			if (seat) {
				await prisma.ticket.create({
					data: {
						price: 22,
						status: faker.helpers.arrayElement(['booked', 'cancelled']),
						seatId: seat.id,
						reservationId: reservation.id,
					},
				});
			}
		}

		// Create Payment for this Reservation
		await prisma.payment.create({
			data: {
				amount: 22222,
				status: faker.helpers.arrayElement(['paid', 'pending', 'failed']),
				method: faker.helpers.arrayElement(['credit_card', 'paypal', 'cash']),
				userId: user.id,
				reservationId: reservation.id,
			},
		});

		// Create Feedback from user
		await prisma.feedback.create({
			data: {
				rating: 22,
				comment: faker.lorem.sentences(2),
				userId: user.id,
			},
		});
	}

	console.log('Database seeded successfully');
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
