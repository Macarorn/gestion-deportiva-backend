-- AlterTable
ALTER TABLE `prestamo` ADD COLUMN `aprendizId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Prestamo_aprendizId_idx` ON `Prestamo`(`aprendizId`);

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_aprendizId_fkey` FOREIGN KEY (`aprendizId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
