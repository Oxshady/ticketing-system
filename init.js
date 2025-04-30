import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker';

const prisma = new PrismaClient();

async function main() {
	console.log(' Starting seed...');

	await prisma.feedback.deleteMany();
	await prisma.payment.deleteMany();
	await prisma.reservation.deleteMany();
	await prisma.tripPackage.deleteMany();
	await prisma.trip.deleteMany();
	await prisma.seat.deleteMany();
	await prisma.train.deleteMany();
	await prisma.ticket.deleteMany();
	await prisma.tourPackage.deleteMany();
	await prisma.tourCompany.deleteMany();
	await prisma.user.deleteMany();

	const users = [];
	for (let i = 0; i < 10; i++) {
		const hasGoogle = i % 2 === 0;
		users.push(await prisma.user.create({
			data: {
				firstName: faker.person.firstName(),
				lastName: faker.person.lastName(),
				email: faker.internet.email(),
				...(hasGoogle ? { googleId: faker.string.uuid() } : { password: faker.internet.password() }),
			}
		}));
	}

	const companies = [];
	for (let i = 0; i < 5; i++) {
		companies.push(await prisma.tourCompany.create({
			data: {
				name: faker.company.name(),
				email: faker.internet.email(),
			}
		}));
	}

	const packages = [];
	for (let i = 0; i < 10; i++) {
		packages.push(await prisma.tourPackage.create({
			data: {
				name: faker.lorem.words(2),
				description: faker.lorem.sentence(),
				price: parseFloat(faker.commerce.price()),
				duration: `${faker.number.int({ min: 1, max: 7 })} days`,
				companyId: companies[i % companies.length].id,
			}
		}));
	}

	const trains = [];
	for (let i = 0; i < 5; i++) {
		trains.push(await prisma.train.create({
			data: {
				name: `Train ${faker.string.alpha(3).toUpperCase()}`,
				capacity: faker.number.int({ min: 50, max: 200 }),
				type: faker.helpers.arrayElement(['express', 'local']),
				status: 'active',
			}
		}));
	}

	const seats = [];
	for (let i = 0; i < 40; i++) {
		seats.push(await prisma.seat.create({
			data: {
				seatNumber: i + 1,
				status: faker.helpers.arrayElement(['available', 'booked']),
				class: faker.helpers.arrayElement(['economy', 'first', 'business']),
				trainId: trains[i % trains.length].id,
			}
		}));
	}

	const trips = [];
	for (let i = 0; i < 20; i++) {
		trips.push(await prisma.trip.create({
			data: {
				deppartual: faker.date.future(),
				arrival: faker.date.future({ years: 1 }),
				frequency: faker.helpers.arrayElement(['daily', 'weekly']),
				source: faker.location.city(),
				destination: faker.location.city(),
				stationLocation: faker.location.streetAddress(),
				trainId: trains[i % trains.length].id,
			}
		}));
	}

	const tripPackages = [];
	for (let i = 0; i < 20; i++) {
		tripPackages.push(await prisma.tripPackage.create({
			data: {
				tripId: trips[i].id,
				tourPackageId: packages[i % packages.length].id,
			}
		}));
	}

	const tickets = [];
	for (let i = 0; i < 20; i++) {
		tickets.push(await prisma.ticket.create({
			data: {
				price: parseFloat(faker.commerce.price()),
				status: faker.helpers.arrayElement(['booked', 'cancelled']),
			}
		}));
	}

	for (let i = 0; i < 20; i++) {
		const user = users[i % users.length];
		const seat = seats[i % seats.length];
		const ticket = tickets[i];
		const tripPackage = tripPackages[i % tripPackages.length];

		const reservation = await prisma.reservation.create({
			data: {
				status: faker.helpers.arrayElement(['pending', 'confirmed']),
				userId: user.id,
				ticketId: ticket.id,
				seatId: seat.id,
				tripId: tripPackage.tripId,
				tripPackageTripId: tripPackage.tripId,
				tripPackageTourPackageId: tripPackage.tourPackageId,
			}
		});

		await prisma.payment.create({
			data: {
				amount: ticket.price,
				status: faker.helpers.arrayElement(['completed', 'failed']),
				method: faker.helpers.arrayElement(['credit card', 'paypal', 'cash']),
				userId: user.id,
				reservationId: reservation.id,
			}
		});

		await prisma.feedback.create({
			data: {
				rating: faker.number.int({ min: 1, max: 5 }),
				comment: faker.lorem.sentence(),
				userId: user.id,
			}
		});
	}

	console.log(' Seeding completed.');
}

main()
	.catch(e => {
		console.error(' Seeding error:', e);
		process.exit(1);
	})
	.finally(() => {
		prisma.$disconnect();
	});
