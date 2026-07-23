-- AlterTable: cambiar fotografia de VARCHAR(191) a LONGTEXT para soportar base64
ALTER TABLE `Material` MODIFY COLUMN `fotografia` LONGTEXT NULL;
