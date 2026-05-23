-- AlterTable
ALTER TABLE `material` ADD COLUMN `cantidad_danada` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `cantidad_mantenimiento` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `requiere_serial` BOOLEAN NOT NULL DEFAULT false;
