/*
  Warnings:

  - You are about to drop the column `tourPackageId` on the `Reservation` table. All the data in the column will be lost.
  - The values [HIGH_SPEED] on the enum `Train_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- DropForeignKey
ALTER TABLE `Reservation` DROP FOREIGN KEY `Reservation_tourPackageId_fkey`;

-- DropForeignKey
ALTER TABLE `Reservation` DROP FOREIGN KEY `Reservation_tripId_fkey`;

-- DropIndex
DROP INDEX `Reservation_tourPackageId_fkey` ON `Reservation`;

-- AlterTable
ALTER TABLE `Reservation` DROP COLUMN `tourPackageId`,
    ADD COLUMN `tripTourPackageId` VARCHAR(191) NULL,
    MODIFY `tripId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Train` MODIFY `type` ENUM('EXPRESS', 'LOCAL', 'HIGH', 'SPEED') NOT NULL;

-- CreateTable
CREATE TABLE `TripTourPackage` (
    `id` VARCHAR(191) NOT NULL,
    `tripId` VARCHAR(191) NOT NULL,
    `tourPackageId` VARCHAR(191) NOT NULL,

    INDEX `TripTourPackage_tripId_idx`(`tripId`),
    INDEX `TripTourPackage_tourPackageId_idx`(`tourPackageId`),
    UNIQUE INDEX `TripTourPackage_tripId_tourPackageId_key`(`tripId`, `tourPackageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Reservation_tripTourPackageId_idx` ON `Reservation`(`tripTourPackageId`);

-- AddForeignKey
ALTER TABLE `TripTourPackage` ADD CONSTRAINT `TripTourPackage_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `TripTourPackage` ADD CONSTRAINT `TripTourPackage_tourPackageId_fkey` FOREIGN KEY (`tourPackageId`) REFERENCES `TourPackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_tripId_fkey` FOREIGN KEY (`tripId`) REFERENCES `Trip`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Reservation` ADD CONSTRAINT `Reservation_tripTourPackageId_fkey` FOREIGN KEY (`tripTourPackageId`) REFERENCES `TripTourPackage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
