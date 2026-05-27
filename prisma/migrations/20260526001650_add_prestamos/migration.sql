-- CreateTable
CREATE TABLE `Prestamo` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_prestamo` VARCHAR(20) NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `usuarioSolicitanteId` INTEGER NULL,
    `estado` VARCHAR(191) NOT NULL DEFAULT 'pendiente',
    `fecha_prestamo` DATETIME(3) NOT NULL,
    `fecha_devolucion_esperada` DATETIME(3) NOT NULL,
    `fecha_devolucion_real` DATETIME(3) NULL,
    `hora_entrega` DATETIME(3) NULL,
    `hora_devolucion` DATETIME(3) NULL,
    `observaciones` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Prestamo_numero_prestamo_key`(`numero_prestamo`),
    INDEX `Prestamo_usuarioId_idx`(`usuarioId`),
    INDEX `Prestamo_usuarioSolicitanteId_idx`(`usuarioSolicitanteId`),
    INDEX `Prestamo_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `PrestamoDetalle` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestamoId` INTEGER NOT NULL,
    `materialId` INTEGER NOT NULL,
    `elementoId` INTEGER NULL,
    `cantidad_solicitada` INTEGER NOT NULL,
    `cantidad_entregada` INTEGER NOT NULL DEFAULT 0,
    `cantidad_devuelta` INTEGER NOT NULL DEFAULT 0,
    `cantidad_danada` INTEGER NOT NULL DEFAULT 0,
    `cantidad_faltante` INTEGER NOT NULL DEFAULT 0,
    `observaciones` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `PrestamoDetalle_prestamoId_idx`(`prestamoId`),
    INDEX `PrestamoDetalle_materialId_idx`(`materialId`),
    INDEX `PrestamoDetalle_elementoId_idx`(`elementoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Novedad` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `prestamoId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `cantidad_afectada` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `Novedad_prestamoId_idx`(`prestamoId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `Usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Prestamo` ADD CONSTRAINT `Prestamo_usuarioSolicitanteId_fkey` FOREIGN KEY (`usuarioSolicitanteId`) REFERENCES `Usuario`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrestamoDetalle` ADD CONSTRAINT `PrestamoDetalle_prestamoId_fkey` FOREIGN KEY (`prestamoId`) REFERENCES `Prestamo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrestamoDetalle` ADD CONSTRAINT `PrestamoDetalle_materialId_fkey` FOREIGN KEY (`materialId`) REFERENCES `Material`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PrestamoDetalle` ADD CONSTRAINT `PrestamoDetalle_elementoId_fkey` FOREIGN KEY (`elementoId`) REFERENCES `Elemento`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Novedad` ADD CONSTRAINT `Novedad_prestamoId_fkey` FOREIGN KEY (`prestamoId`) REFERENCES `Prestamo`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
