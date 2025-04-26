/*
  Warnings:

  - Made the column `duration` on table `dailytalksession` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `dailytalksession` MODIFY `duration` INTEGER NOT NULL DEFAULT 5;
