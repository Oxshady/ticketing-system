/*
  Warnings:

  - The values [EXPRESS,LOCAL,HIGH_SPEED] on the enum `Train_type` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `pointsToRedeem` INTEGER NULL;

-- AlterTable
ALTER TABLE `Train` MODIFY `type` ENUM('Talgo_First_Class', 'Talgo_Second_Class', 'First_Class_AC', 'Second_Class_AC', 'Second_Class_Non_AC', 'Third_Class_AC', 'Third_Class_Non_AC', 'Sleeper_shared_Class', 'Sleeper_single_class') NOT NULL;
