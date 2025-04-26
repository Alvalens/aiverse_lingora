/*
  Warnings:

  - You are about to drop the column `description` on the `storytellingsession` table. All the data in the column will be lost.
  - You are about to drop the column `theme` on the `storytellingsession` table. All the data in the column will be lost.
  - Made the column `image` on table `storytellingsession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `dailytalksession` MODIFY `suggestions` TEXT NULL;

-- AlterTable
ALTER TABLE `storytellingsession` DROP COLUMN `description`,
    DROP COLUMN `theme`,
    MODIFY `image` VARCHAR(191) NOT NULL;
