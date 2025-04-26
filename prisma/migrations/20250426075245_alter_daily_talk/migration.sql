-- AlterTable
ALTER TABLE `dailytalksession` MODIFY `suggestions` JSON NULL,
    MODIFY `duration` INTEGER NULL DEFAULT 5,
    MODIFY `score` INTEGER NULL;
