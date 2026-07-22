-- AlterTable
ALTER TABLE `prestamo`
    ADD COLUMN `validacion_realizada` BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN `documento_validacion` LONGTEXT NULL;
