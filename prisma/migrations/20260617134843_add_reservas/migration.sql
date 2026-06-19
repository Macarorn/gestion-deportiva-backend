-- CreateTable
CREATE TABLE `reserva` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `numero_reserva` VARCHAR(20) NOT NULL,
    `escenarioId` INTEGER NOT NULL,
    `usuarioId` INTEGER NOT NULL,
    `fecha` DATE NOT NULL,
    `hora_inicio` VARCHAR(5) NOT NULL,
    `hora_fin` VARCHAR(5) NOT NULL,
    `estado` VARCHAR(20) NOT NULL DEFAULT 'pendiente',
    `observaciones` VARCHAR(191) NULL,
    `observaciones_cierre` VARCHAR(191) NULL,
    `observaciones_cancelacion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `reserva_numero_reserva_key`(`numero_reserva`),
    INDEX `Reserva_escenarioId_idx`(`escenarioId`),
    INDEX `Reserva_usuarioId_idx`(`usuarioId`),
    INDEX `Reserva_estado_idx`(`estado`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_escenarioId_fkey` FOREIGN KEY (`escenarioId`) REFERENCES `escenario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reserva` ADD CONSTRAINT `reserva_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuario`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
