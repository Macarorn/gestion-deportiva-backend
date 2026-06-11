-- CreateTable
CREATE TABLE `escenario` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `ubicacion` VARCHAR(191) NOT NULL,
    `capacidad_maxima` INTEGER NOT NULL,
    `estado` BOOLEAN NOT NULL DEFAULT true,
    `horario_disponibilidad` VARCHAR(191) NULL,
    `observaciones` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
