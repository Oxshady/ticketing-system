/*
  Warnings:

  - You are about to drop the column `price` on the `Ticket` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Ticket` DROP COLUMN `price`,
    ADD COLUMN `status` ENUM('RESERVED', 'CANCELLED', 'EXPIRED', 'PENDING') NOT NULL DEFAULT 'PENDING';
