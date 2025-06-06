const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const governorates = [
    'Cairo', 'Alexandria', 'Giza', 'Shubra El-Kheima', 'Port Said', 'Suez',
    'Luxor', 'Mansoura', 'El-Mahalla El-Kubra', 'Tanta', 'Asyut', 'Ismailia',
    'Faiyum', 'Zagazig', 'Aswan', 'Damietta', 'Damanhur', 'Minya', 'Beni Suef',
    'Qena', 'Sohag', 'Hurghada', '6th of October City', 'Shibin El Kom', 'Banha',
    'Kafr El Sheikh', 'Arish'
];

// Replace old trainTypes with your schema enum values
const trainTypes = [
    'Talgo_First_Class',
    'Talgo_Second_Class',
    'First_Class_AC',
    'Second_Class_AC',
    'Second_Class_Non_AC',
    'Third_Class_AC',
    'Third_Class_Non_AC',
    'Sleeper_shared_Class',
    'Sleeper_single_class'
];

const seatClasses = ['ECONOMY', 'BUSINESS', 'FIRST_CLASS'];

const popularRoutes = [
    { from: 'Cairo', to: 'Alexandria', duration: 2.5, dailyTrips: 12 },
    { from: 'Cairo', to: 'Luxor', duration: 10, dailyTrips: 8 },
    { from: 'Cairo', to: 'Aswan', duration: 12, dailyTrips: 6 },
    { from: 'Alexandria', to: 'Port Said', duration: 4, dailyTrips: 6 },
    { from: 'Giza', to: 'Suez', duration: 1.5, dailyTrips: 10 },
    { from: 'Cairo', to: 'Ismailia', duration: 2, dailyTrips: 8 },
    { from: 'Luxor', to: 'Aswan', duration: 3, dailyTrips: 8 },
    { from: 'Cairo', to: 'Tanta', duration: 1.5, dailyTrips: 12 },
    { from: 'Alexandria', to: 'Damietta', duration: 3, dailyTrips: 6 },
    { from: 'Cairo', to: 'Faiyum', duration: 2, dailyTrips: 8 }
];

const tourCompanies = [
    { 
        name: "Egyptian Travel Adventures", 
        email: "info@egyptiantravel.com",
        phone: "+20-2-12345678",
        address: "123 Tahrir Square, Cairo, Egypt"
    },
    { 
        name: "Nile Explorer Tours", 
        email: "contact@nileexplorer.com",
        phone: "+20-2-87654321",
        address: "456 Corniche El Nil, Luxor, Egypt"
    },
    { 
        name: "Pharaoh's Journey", 
        email: "bookings@pharaohsjourney.com",
        phone: "+20-2-11223344",
        address: "789 Pyramids Road, Giza, Egypt"
    },
    { 
        name: "Pyramid Travel Egypt", 
        email: "support@pyramidtravel.com",
        phone: "+20-2-55667788",
        address: "321 Zamalek Street, Cairo, Egypt"
    },
    { 
        name: "Red Sea Holidays", 
        email: "info@redseaholidays.com",
        phone: "+20-65-998877",
        address: "654 Marina Boulevard, Hurghada, Egypt"
    }
];

// Tour packages data
const tourPackages = [
    { name: "Classic Egypt Tour", description: "7-day tour covering Cairo, Luxor, and Aswan with professional guide", price: 1200, duration: "7 days" },
    { name: "Nile Cruise Experience", description: "5-day luxury Nile cruise from Luxor to Aswan with all meals included", price: 1500, duration: "5 days" },
    { name: "Red Sea Getaway", description: "4-day beach vacation in Hurghada with water sports activities", price: 800, duration: "4 days" },
    { name: "Alexandria Cultural Tour", description: "3-day exploration of Alexandria's rich history and Mediterranean culture", price: 500, duration: "3 days" },
    { name: "Western Desert Adventure", description: "6-day safari in the Western Desert with camping under the stars", price: 1100, duration: "6 days" },
    { name: "Cairo Highlights", description: "2-day tour of Cairo's main attractions including Pyramids and Egyptian Museum", price: 300, duration: "2 days" },
    { name: "Luxor Temple Tour", description: "1-day intensive tour of Luxor's ancient temples and Valley of the Kings", price: 150, duration: "1 day" },
    { name: "Aswan & Abu Simbel", description: "3-day tour focusing on Aswan's beauty and the magnificent Abu Simbel temples", price: 600, duration: "3 days" }
];

// Generate realistic Egyptian train names with numbers
function generateEgyptianTrainName(index) {
    const names = [
        'Nile Express', 'Pharaoh Express', 'Ramses Express', 'Cleopatra Express',
        'Horizon Express', 'Delta Express', 'Sun Express', 'Golden Express',
        'Silver Express', 'Diamond Express', 'Platinum Express', 'Royal Express'
    ];
    return `${names[index % names.length]} ${Math.floor(index / names.length) + 1}`;
}

// Generate departure times throughout the day
function generateDepartureTimes(count) {
    const times = [];
    const startHour = 6; // 6 AM
    const endHour = 22; // 10 PM

    for (let i = 0; i < count; i++) {
        const hour = startHour + Math.floor((endHour - startHour) * i / count);
        const minute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
        times.push(`${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`);
    }

    return times;
}

// Update price calculation logic for new train types
function calculateTripPrice(trainType, durationHours, basePrice = 50) {
    let priceMultiplier = 1;

    if (['Talgo_First_Class', 'First_Class_AC', 'Sleeper_single_class'].includes(trainType)) priceMultiplier = 2.5;
    else if (['Talgo_Second_Class', 'Second_Class_AC', 'Second_Class_Non_AC', 'Sleeper_shared_Class'].includes(trainType)) priceMultiplier = 1.8;
    else if (['Third_Class_AC', 'Third_Class_Non_AC'].includes(trainType)) priceMultiplier = 1.2;

    const distanceFactor = 1 + (durationHours * 0.1);

    return Math.round((basePrice * priceMultiplier * distanceFactor) / 10) * 10;
}

// Update seat distribution logic for new train types
function getSeatDistribution(trainType, capacity) {
    switch (trainType) {
        case 'Talgo_First_Class':
        case 'First_Class_AC':
        case 'Sleeper_single_class':
            return {
                FIRST_CLASS: Math.floor(capacity * 0.5),
                BUSINESS: Math.floor(capacity * 0.3),
                ECONOMY: Math.floor(capacity * 0.2)
            };
        case 'Talgo_Second_Class':
        case 'Second_Class_AC':
        case 'Second_Class_Non_AC':
        case 'Sleeper_shared_Class':
            return {
                FIRST_CLASS: Math.floor(capacity * 0.2),
                BUSINESS: Math.floor(capacity * 0.3),
                ECONOMY: Math.floor(capacity * 0.5)
            };
        case 'Third_Class_AC':
        case 'Third_Class_Non_AC':
            return {
                FIRST_CLASS: Math.floor(capacity * 0.05),
                BUSINESS: Math.floor(capacity * 0.15),
                ECONOMY: Math.floor(capacity * 0.8)
            };
        default:
            return {
                FIRST_CLASS: 0,
                BUSINESS: 0,
                ECONOMY: capacity
            };
    }
}

async function main() {
    console.log('Starting comprehensive Egyptian Railways database population...');

    try {
        // Clean existing data (in reverse dependency order)
        console.log('Cleaning existing data...');
        await prisma.feedback.deleteMany({});
        await prisma.payment.deleteMany({});
        await prisma.ticket.deleteMany({});
        await prisma.reservation.deleteMany({});
        await prisma.tripTourPackage.deleteMany({});
        await prisma.trip.deleteMany({});
        await prisma.seat.deleteMany({});
        await prisma.train.deleteMany({});
        await prisma.tourPackage.deleteMany({});
        await prisma.tourCompany.deleteMany({});
        await prisma.user.deleteMany({});
        console.log('✓ Existing data cleaned');

        // Create tour companies
        console.log('Creating tour companies...');
        const createdCompanies = [];
        for (const company of tourCompanies) {
            const createdCompany = await prisma.tourCompany.create({
                data: {
                    name: company.name,
                    email: company.email,
                    phone: company.phone,
                    address: company.address
                }
            });
            createdCompanies.push(createdCompany);
            console.log(`✓ Created tour company: ${createdCompany.name}`);
        }

        // Create tour packages and assign to companies
        console.log('Creating tour packages...');
        const createdPackages = [];
        for (let i = 0; i < tourPackages.length; i++) {
            const packageData = tourPackages[i];
            const company = createdCompanies[i % createdCompanies.length];
            
            const createdPackage = await prisma.tourPackage.create({
                data: {
                    name: packageData.name,
                    description: packageData.description,
                    price: packageData.price,
                    duration: packageData.duration,
                    status: 'ACTIVE',
                    companyId: company.id
                }
            });
            createdPackages.push(createdPackage);
            console.log(`✓ Created tour package: ${createdPackage.name} for ${company.name}`);
        }

        // Create trains with Egyptian names and proper types
        console.log('Creating trains...');
        const trains = [];
        for (let i = 0; i < 20; i++) {
            const trainType = trainTypes[Math.floor(Math.random() * trainTypes.length)];
            const capacity = Math.floor(Math.random() * 500) + 200; // 200-700 capacity

            const train = await prisma.train.create({
                data: {
                    name: generateEgyptianTrainName(i),
                    capacity: capacity,
                    type: trainType,
                    status: Math.random() > 0.1 ? 'ACTIVE' : 'MAINTENANCE' // 90% active
                }
            });
            trains.push(train);
            console.log(`✓ Created train: ${train.name} (${train.type}, capacity: ${train.capacity})`);
        }

        // Create seats for each train according to type and class
        console.log('Creating seats for trains...');
        for (const train of trains) {
            const seatDistribution = getSeatDistribution(train.type, train.capacity);
            let seatNumber = 1;

            // Create First Class seats
            for (let i = 0; i < seatDistribution.FIRST_CLASS; i++) {
                await prisma.seat.create({
                    data: {
                        seatNumber: `${seatNumber}`,
                        class: 'FIRST_CLASS',
                        trainId: train.id
                    }
                });
                seatNumber++;
            }

            // Create Business Class seats
            for (let i = 0; i < seatDistribution.BUSINESS; i++) {
                await prisma.seat.create({
                    data: {
                        seatNumber: `${seatNumber}`,
                        class: 'BUSINESS',
                        trainId: train.id
                    }
                });
                seatNumber++;
            }

            // Create Economy Class seats
            for (let i = 0; i < seatDistribution.ECONOMY; i++) {
                await prisma.seat.create({
                    data: {
                        seatNumber: `${seatNumber}`,
                        class: 'ECONOMY',
                        trainId: train.id
                    }
                });
                seatNumber++;
            }

            console.log(`✓ Created ${seatDistribution.FIRST_CLASS} First Class, ${seatDistribution.BUSINESS} Business, and ${seatDistribution.ECONOMY} Economy seats for ${train.name}`);
        }

        // Create trips for popular routes
        console.log('Creating trips for popular routes...');
        const trips = [];
        const daysToGenerate = 30; // Generate schedule for 30 days

        for (let day = 0; day < daysToGenerate; day++) {
            const date = new Date();
            date.setDate(date.getDate() + day + 1); // Start from tomorrow

            for (const route of popularRoutes) {
                const departureTimes = generateDepartureTimes(route.dailyTrips);

                for (const time of departureTimes) {
                    const [hours, minutes] = time.split(':').map(Number);

                    const departure = new Date(date);
                    departure.setHours(hours, minutes, 0, 0);

                    const arrival = new Date(departure);
                    arrival.setHours(arrival.getHours() + Math.floor(route.duration));
                    arrival.setMinutes(arrival.getMinutes() + Math.floor((route.duration % 1) * 60));

                    // Find appropriate train for this route (longer routes get better trains)
                    const suitableTrains = trains.filter(train => {
                        if (train.status !== 'ACTIVE') return false;
                        if (route.duration > 8) return train.type === 'HIGH_SPEED' || train.type === 'EXPRESS';
                        if (route.duration > 3) return train.type === 'EXPRESS' || train.type === 'LOCAL';
                        return true;
                    });

                    if (suitableTrains.length > 0) {
                        const train = suitableTrains[Math.floor(Math.random() * suitableTrains.length)];

                        try {
                            const trip = await prisma.trip.create({
                                data: {
                                    departure,
                                    arrival,
                                    frequency: 'Daily',
                                    source: route.from,
                                    destination: route.to,
                                    stationLocation: `${route.from} Central Station`,
                                    price: calculateTripPrice(train.type, route.duration),
                                    status: 'SCHEDULED',
                                    trainId: train.id
                                }
                            });
                            trips.push(trip);
                        } catch (error) {
                            if (!error.message.includes('Unique constraint')) {
                                console.error(`Error creating trip: ${error.message}`);
                            }
                        }
                    }
                }
            }
        }

        // Create return trips for all routes
        console.log('Creating return trips...');
        for (let day = 0; day < daysToGenerate; day++) {
            const date = new Date();
            date.setDate(date.getDate() + day + 1);

            for (const route of popularRoutes) {
                const returnRoute = {
                    from: route.to,
                    to: route.from,
                    duration: route.duration,
                    dailyTrips: Math.floor(route.dailyTrips * 0.8) // Slightly fewer return trips
                };

                const departureTimes = generateDepartureTimes(returnRoute.dailyTrips);

                for (const time of departureTimes) {
                    const [hours, minutes] = time.split(':').map(Number);

                    const departure = new Date(date);
                    departure.setHours(hours, minutes, 0, 0);

                    const arrival = new Date(departure);
                    arrival.setHours(arrival.getHours() + Math.floor(returnRoute.duration));
                    arrival.setMinutes(arrival.getMinutes() + Math.floor((returnRoute.duration % 1) * 60));

                    // Find appropriate train for this route
                    const suitableTrains = trains.filter(train => {
                        if (train.status !== 'ACTIVE') return false;
                        if (returnRoute.duration > 8) return train.type === 'HIGH_SPEED' || train.type === 'EXPRESS';
                        if (returnRoute.duration > 3) return train.type === 'EXPRESS' || train.type === 'LOCAL';
                        return true;
                    });

                    if (suitableTrains.length > 0) {
                        const train = suitableTrains[Math.floor(Math.random() * suitableTrains.length)];

                        try {
                            const trip = await prisma.trip.create({
                                data: {
                                    departure,
                                    arrival,
                                    frequency: 'Daily',
                                    source: returnRoute.from,
                                    destination: returnRoute.to,
                                    stationLocation: `${returnRoute.from} Central Station`,
                                    price: calculateTripPrice(train.type, returnRoute.duration),
                                    status: 'SCHEDULED',
                                    trainId: train.id
                                }
                            });
                            trips.push(trip);
                        } catch (error) {
                            if (!error.message.includes('Unique constraint')) {
                                console.error(`Error creating return trip: ${error.message}`);
                            }
                        }
                    }
                }
            }
        }

        console.log(`✓ Created ${trips.length} trips across ${daysToGenerate} days`);

        // Create TripTourPackage combinations (junction table entries)
        console.log('Creating trip-tour package combinations...');
        const tripTourPackages = [];
        
        // Create combinations for trips that go to tourist destinations
        const touristDestinations = ['Luxor', 'Aswan', 'Alexandria', 'Hurghada'];
        const relevantTrips = trips.filter(trip => 
            touristDestinations.includes(trip.destination) || touristDestinations.includes(trip.source)
        );

        for (let i = 0; i < Math.min(50, relevantTrips.length); i++) {
            const trip = relevantTrips[i];
            const randomPackage = createdPackages[Math.floor(Math.random() * createdPackages.length)];
            
            try {
                const tripTourPackage = await prisma.tripTourPackage.create({
                    data: {
                        tripId: trip.id,
                        tourPackageId: randomPackage.id
                    }
                });
                tripTourPackages.push(tripTourPackage);
            } catch (error) {
                // Skip if combination already exists
                if (!error.message.includes('Unique constraint')) {
                    console.error(`Error creating trip-tour package combination: ${error.message}`);
                }
            }
        }

        console.log(`✓ Created ${tripTourPackages.length} trip-tour package combinations`);

        // // Create some sample users
        // console.log('Creating sample users...');
        // const sampleUsers = [
        //     { firstName: 'Ahmed', lastName: 'Hassan', email: 'ahmed.hassan@example.com', points: 150 },
        //     { firstName: 'Fatma', lastName: 'Ali', email: 'fatma.ali@example.com', points: 200 },
        //     { firstName: 'Mohamed', lastName: 'Ibrahim', email: 'mohamed.ibrahim@example.com', points: 75 },
        //     { firstName: 'Nour', lastName: 'Mahmoud', email: 'nour.mahmoud@example.com', points: 300 },
        //     { firstName: 'Youssef', lastName: 'Ahmed', email: 'youssef.ahmed@example.com', points: 125 },
        //     { firstName: 'Yasmine', lastName: 'Khaled', email: 'yasmine.khaled@example.com', points: 180 },
        //     { firstName: 'Omar', lastName: 'Mostafa', email: 'omar.mostafa@example.com', points: 90 },
        //     { firstName: 'Salma', lastName: 'Farouk', email: 'salma.farouk@example.com', points: 250 }
        // ];

        // const createdUsers = [];
        // for (const userData of sampleUsers) {
        //     const user = await prisma.user.create({
        //         data: {
        //             firstName: userData.firstName,
        //             lastName: userData.lastName,
        //             email: userData.email,
        //             points: userData.points,
        //             password: '$2b$10$hashedpassword123' // In real app, this would be properly hashed
        //         }
        //     });
        //     createdUsers.push(user);
        //     console.log(`✓ Created user: ${user.firstName} ${user.lastName}`);
        // }

        // // Create sample reservations with tickets and payments
        // console.log('Creating sample reservations...');
        // const createdReservations = [];
        
        // for (let i = 0; i < 25; i++) {
        //     const user = createdUsers[Math.floor(Math.random() * createdUsers.length)];
        //     const usePackage = Math.random() > 0.7; // 30% chance to use package
            
        //     let reservationData = {
        //         status: ['PENDING', 'CONFIRMED', 'COMPLETED'][Math.floor(Math.random() * 3)],
        //         userId: user.id
        //     };

        //     if (usePackage && tripTourPackages.length > 0) {
        //         // Use trip-tour package combination
        //         const tripTourPackage = tripTourPackages[Math.floor(Math.random() * tripTourPackages.length)];
        //         reservationData.tripTourPackageId = tripTourPackage.id;
        //     } else {
        //         // Use direct trip
        //         const trip = trips[Math.floor(Math.random() * trips.length)];
        //         reservationData.tripId = trip.id;
        //     }

        //     try {
        //         const reservation = await prisma.reservation.create({
        //             data: reservationData
        //         });
        //         createdReservations.push(reservation);
        //     } catch (error) {
        //         console.error(`Error creating reservation: ${error.message}`);
        //     }
        // }

        // console.log('Creating sample tickets...');
        // let ticketCount = 0;
        
        // for (const reservation of createdReservations) {
        //     const numTickets = Math.floor(Math.random() * 3) + 1; // 1-3 tickets per reservation
        //     let tripId = reservation.tripId;
            
        //     if (reservation.tripTourPackageId) {
        //         const tripTourPackage = await prisma.tripTourPackage.findUnique({
        //             where: { id: reservation.tripTourPackageId },
        //             include: { trip: true }
        //         });
        //         tripId = tripTourPackage.trip.id;
        //     }

        //     if (tripId) {
        //         const trip = await prisma.trip.findUnique({
        //             where: { id: tripId },
        //             include: { 
        //                 train: { 
        //                     include: { seats: true } 
        //                 },
        //                 tickets: { include: { seat: true } }
        //             }
        //         });

        //         if (trip) {
        //             const bookedSeatIds = trip.tickets.map(ticket => ticket.seat.id);
        //             const availableSeats = trip.train.seats.filter(seat => !bookedSeatIds.includes(seat.id));

        //             for (let j = 0; j < Math.min(numTickets, availableSeats.length); j++) {
        //                 const seat = availableSeats[j];
        //                 let ticketPrice = trip.price;
                        
        //                 if (seat.class === 'BUSINESS') ticketPrice *= 1.5;
        //                 else if (seat.class === 'FIRST_CLASS') ticketPrice *= 2;

        //                 try {
        //                     await prisma.ticket.create({
        //                         data: {
        //                             price: ticketPrice,
        //                             reservationId: reservation.id,
        //                             seatId: seat.id,
        //                             tripId: tripId
        //                         }
        //                     });
        //                     ticketCount++;
        //                 } catch (error) {
        //                     console.error(`Error creating ticket: ${error.message}`);
        //                 }
        //             }
        //         }
        //     }
        // }

        // console.log('Creating sample payments...');
        // let paymentCount = 0;
        
        // for (const reservation of createdReservations) {
        //     const tickets = await prisma.ticket.findMany({
        //         where: { reservationId: reservation.id }
        //     });
            
        //     if (tickets.length > 0) {
        //         const totalAmount = tickets.reduce((sum, ticket) => sum + ticket.price, 0);
                
        //         try {
        //             await prisma.payment.create({
        //                 data: {
        //                     amount: totalAmount,
        //                     status: ['PENDING', 'COMPLETED', 'FAILED'][Math.floor(Math.random() * 3)],
        //                     method: ['CARD', 'CASH', 'BANK_TRANSFER'][Math.floor(Math.random() * 3)],
        //                     userId: reservation.userId,
        //                     reservationId: reservation.id
        //                 }
        //             });
        //             paymentCount++;
        //         } catch (error) {
        //             console.error(`Error creating payment: ${error.message}`);
        //         }
        //     }
        // }

        // console.log('Creating sample feedback...');
        // let feedbackCount = 0;
        
        // for (let i = 0; i < Math.min(15, createdReservations.length); i++) {
        //     const reservation = createdReservations[i];
        //     const comments = [
        //         "Great service and comfortable journey!",
        //         "Train was on time and staff was helpful.",
        //         "Could improve the food quality.",
        //         "Excellent experience, will book again.",
        //         "Seats were comfortable and clean.",
        //         "Delayed departure but overall good service.",
        //         "Amazing views during the trip!",
        //         "Professional staff and smooth journey."
        //     ];

        //     try {
        //         await prisma.feedback.create({
        //             data: {
        //                 rating: Math.floor(Math.random() * 5) + 1, // 1-5 rating
        //                 comment: comments[Math.floor(Math.random() * comments.length)],
        //                 userId: reservation.userId,
        //                 reservationId: reservation.id
        //             }
        //         });
        //         feedbackCount++;
        //     } catch (error) {
        //         console.error(`Error creating feedback: ${error.message}`);
        //     }
        // }

        console.log('\n Egyptian Railways database population completed successfully!');
        console.log(` Summary:`);
        console.log(`   • ${createdCompanies.length} tour companies`);
        console.log(`   • ${createdPackages.length} tour packages`);
        console.log(`   • ${trains.length} trains`);
        console.log(`   • ${trips.length} trips scheduled`);
        console.log(`   • ${tripTourPackages.length} trip-tour package combinations`);
        // console.log(`   • ${createdUsers.length} sample users`);
        // console.log(`   • ${createdReservations.length} reservations`);
        // console.log(`   • ${ticketCount} tickets`);
        // console.log(`   • ${paymentCount} payments`);
        // console.log(`   • ${feedbackCount} feedback entries`);
        
    } catch (error) {
        console.error(' Error during database population:', error);
        throw error;
    }
}

main()
    .catch(e => {
        console.error(' Fatal error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
        console.log(' Database connection closed');
    });