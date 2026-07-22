-- CreateTable
CREATE TABLE `configuracion_validacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `plantilla_pdf` LONGTEXT NULL,
    `contacto_nombre` VARCHAR(191) NULL,
    `contacto_telefono` VARCHAR(191) NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
