/*
  Warnings:

  - A unique constraint covering the columns `[paymobOrderId]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `paymobOrderId` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_paymobOrderId_key` ON `Payment`(`paymobOrderId`);
