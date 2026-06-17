-- AlterTable: Change horario_disponibilidad from VARCHAR to JSON
ALTER TABLE `escenario` MODIFY COLUMN `horario_disponibilidad` JSON NULL;
