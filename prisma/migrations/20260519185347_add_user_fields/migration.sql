/*
  Warnings:

  - A unique constraint covering the columns `[numero_documento]` on the table `Usuario` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `apellido` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `numero_documento` to the `Usuario` table without a default value. This is not possible if the table is not empty.
  - Added the required column `telefono` to the `Usuario` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `usuario` ADD COLUMN `apellido` VARCHAR(191) NOT NULL,
    ADD COLUMN `ficha` VARCHAR(191) NULL,
    ADD COLUMN `numero_documento` VARCHAR(191) NOT NULL,
    ADD COLUMN `observaciones` VARCHAR(191) NULL,
    ADD COLUMN `telefono` VARCHAR(191) NOT NULL,
    MODIFY `tipo_usuario` ENUM('Instructor', 'Administrador', 'Almacenista', 'Aprendiz', 'Externo') NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Usuario_numero_documento_key` ON `Usuario`(`numero_documento`);
