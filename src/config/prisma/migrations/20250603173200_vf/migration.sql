/*
  Warnings:

  - The values [HIGH,SPEED] on the enum `Train_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Train` MODIFY `type` ENUM('EXPRESS', 'LOCAL', 'HIGH_SPEED') NOT NULL;
