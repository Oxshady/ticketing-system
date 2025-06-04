-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(191) NOT NULL,
    `lastName` VARCHAR(191) NOT NULL,
    `points` INTEGER NOT NULL DEFAULT 0,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NULL,
    `googleId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    UNIQUE INDEX `User_googleId_key`(`googleId`),
    INDEX `User_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Reservation` (
    `id` VARCHAR(191) NOT NULL,
    `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') NOT NULL DEFAULT 'PENDING',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `tourPackageId` VARCHAR(191) NULL,

    INDEX `Reservation_userId_idx`(`userId`),
    INDEX `Reservation_tripId_idx`(`tripId`),
    INDEX `Reservation_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Ticket` (
    `id` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,
    `seatId` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,

    INDEX `Ticket_reservationId_tripId_idx`(`reservationId`, `tripId`),
    UNIQUE INDEX `Ticket_seatId_tripId_key`(`seatId`, `tripId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Payment` (
    `id` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    `method` ENUM('CARD', 'CASH', 'BANK_TRANSFER') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Payment_reservationId_key`(`reservationId`),
    INDEX `Payment_userId_idx`(`userId`),
    INDEX `Payment_status_idx`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Feedback` (
    `id` VARCHAR(191) NOT NULL,
    `rating` TINYINT NOT NULL,
    `comment` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `reservationId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `Feedback_reservationId_key`(`reservationId`),
    INDEX `Feedback_userId_idx`(`userId`),
    INDEX `Feedback_rating_idx`(`rating`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Train` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `capacity` INTEGER NOT NULL,
    `type` ENUM('EXPRESS', 'LOCAL', 'HIGH_SPEED') NOT NULL,
    `status` ENUM('ACTIVE', 'MAINTENANCE', 'RETIRED') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Train_name_key`(`name`),
    INDEX `Train_status_idx`(`status`),
    INDEX `Train_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Seat` (
    `id` VARCHAR(191) NOT NULL,
    `seatNumber` VARCHAR(191) NOT NULL,
    `class` ENUM('ECONOMY', 'BUSINESS', 'FIRST_CLASS') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `trainId` VARCHAR(191) NOT NULL,

    INDEX `Seat_trainId_class_idx`(`trainId`, `class`),
    UNIQUE INDEX `Seat_trainId_seatNumber_key`(`trainId`, `seatNumber`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Trip` (
    `id` VARCHAR(191) NOT NULL,
    `departure` DATETIME(3) NOT NULL,
    `arrival` DATETIME(3) NOT NULL,
    `frequency` VARCHAR(191) NOT NULL,
    `price` DOUBLE NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `destination` VARCHAR(191) NOT NULL,
    `stationLocation` VARCHAR(191) NOT NULL,
    `status` ENUM('SCHEDULED', 'CANCELLED', 'COMPLETED', 'DELAYED') NOT NULL DEFAULT 'SCHEDULED',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `trainId` VARCHAR(191) NOT NULL,

    INDEX `Trip_trainId_departure_arrival_idx`(`trainId`, `departure`, `arrival`),
    INDEX `Trip_source_destination_idx`(`source`, `destination`),
    INDEX `Trip_departure_idx`(`departure`),
    INDEX `Trip_status_idx`(`status`),
    UNIQUE INDEX `Trip_trainId_departure_key`(`trainId`, `departure`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourCompany` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `TourCompany_name_key`(`name`),
    UNIQUE INDEX `TourCompany_email_key`(`email`),
    INDEX `TourCompany_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `TourPackage` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NOT NULL,
    `price` DOUBLE NOT NULL,
    `duration` VARCHAR(191) NOT NULL,
    `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `companyId` VARCHAR(191) NOT NULL,

    INDEX `TourPackage_companyId_idx`(`companyId`),
    INDEX `TourPackage_status_idx`(`status`),
    UNIQUE INDEX `TourPackage_companyId_name_key`(`companyId`, `name`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_tourPackageId_fkey` FOREIGN KEY (`tourPackageId`) REFERENCES `TourPackage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_seatId_fkey` FOREIGN KEY (`seatId`) REFERENCES `Seat`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Ticket` ADD CONSTRAINT `Ticket_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Feedback` ADD CONSTRAINT `Feedback_reservationId_fkey` FOREIGN KEY (`reservationId`) REFERENCES `Reservation`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Seat` ADD CONSTRAINT `Seat_trainId_fkey` FOREIGN KEY (`trainId`) REFERENCES `Train`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Trip` ADD CONSTRAINT `Trip_trainId_fkey` FOREIGN KEY (`trainId`) REFERENCES `Train`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TourPackage` ADD CONSTRAINT `TourPackage_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `TourCompany`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
