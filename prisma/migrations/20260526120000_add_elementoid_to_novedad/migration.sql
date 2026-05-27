-- AlterTable
ALTER TABLE `Novedad` ADD COLUMN `elementoId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Novedad` ADD CONSTRAINT `Novedad_elementoId_fkey` FOREIGN KEY (`elementoId`) REFERENCES `Elemento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex
CREATE INDEX `Novedad_elementoId_idx` ON `Novedad`(`elementoId`);
