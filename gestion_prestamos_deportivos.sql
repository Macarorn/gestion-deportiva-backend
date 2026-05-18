-- -----------------------------------------------------
-- Base de datos: sistema de gestión de préstamos deportivos
-- MySQL 8+
-- -----------------------------------------------------

DROP DATABASE IF EXISTS gestion_prestamos_deportivos;
CREATE DATABASE gestion_prestamos_deportivos
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_spanish_ci;

USE gestion_prestamos_deportivos;

-- -----------------------------------------------------
-- Tabla: usuario
-- -----------------------------------------------------
CREATE TABLE usuario (
  idUsuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_usuario VARCHAR(100) NOT NULL,
  apellido_usuario VARCHAR(100) NULL,
  documento VARCHAR(20) NULL UNIQUE,
  correo VARCHAR(150) NULL UNIQUE,
  telefono VARCHAR(20) NULL,
  tipo_usuario VARCHAR(20) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  observaciones TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: categoria
-- -----------------------------------------------------
CREATE TABLE categoria (
  idcategoria INT AUTO_INCREMENT PRIMARY KEY,
  categoria VARCHAR(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: subcategoria
-- -----------------------------------------------------
CREATE TABLE subcategoria (
  idsubcategoria INT AUTO_INCREMENT PRIMARY KEY,
  idcategoria INT NOT NULL,
  subcategoria VARCHAR(45) NOT NULL,
  CONSTRAINT fk_subcategoria_categoria
    FOREIGN KEY (idcategoria) REFERENCES categoria(idcategoria)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: item
-- -----------------------------------------------------
CREATE TABLE item (
  idItem INT AUTO_INCREMENT PRIMARY KEY,
  idsubcategoria INT NOT NULL,
  nombre_item VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  estado VARCHAR(20) NOT NULL,
  cantidad_total INT NOT NULL DEFAULT 0,
  cantidad_disponible INT NOT NULL DEFAULT 0,
  cantidad_prestada INT NOT NULL DEFAULT 0,
  fotografia VARCHAR(255) NULL,
  observaciones TEXT NULL,
  CONSTRAINT fk_item_subcategoria
    FOREIGN KEY (idsubcategoria) REFERENCES subcategoria(idsubcategoria)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: elemento
-- -----------------------------------------------------
CREATE TABLE elemento (
  idelemento INT AUTO_INCREMENT PRIMARY KEY,
  idItem INT NOT NULL,
  nombre_elemento VARCHAR(60) NOT NULL,
  estado VARCHAR(20) NOT NULL,
  observaciones TEXT NULL,
  CONSTRAINT fk_elemento_item
    FOREIGN KEY (idItem) REFERENCES item(idItem)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: prestamo
-- -----------------------------------------------------
CREATE TABLE prestamo (
  idPrestamo INT AUTO_INCREMENT PRIMARY KEY,
  idUsuario INT NOT NULL,
  fecha_entrega DATE NOT NULL,
  fecha_Devolucion DATE NOT NULL,
  Hora_entrega TIME NOT NULL,
  hora_devolucion TIME NULL,
  estado VARCHAR(20) NOT NULL,
  Prestamocol VARCHAR(45) NULL,
  tipo_prestamo VARCHAR(20) NOT NULL,
  observaciones TEXT NULL,
  salida_fuera_campus BOOLEAN DEFAULT FALSE,
  prestamo_externo BOOLEAN DEFAULT FALSE,
  idEscenario INT NULL,
  CONSTRAINT fk_prestamo_usuario
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: detalle_prestamo
-- -----------------------------------------------------
CREATE TABLE detalle_prestamo (
  idDetalle_prestamo INT AUTO_INCREMENT PRIMARY KEY,
  idPrestamo INT NOT NULL,
  idelemento INT NOT NULL,
  cantidad_solicitada INT NOT NULL DEFAULT 1,
  cantidad_entregada INT NOT NULL DEFAULT 0,
  cantidad_devuelta INT NOT NULL DEFAULT 0,
  cantidad_dañada INT NOT NULL DEFAULT 0,
  cantidad_faltante INT NOT NULL DEFAULT 0,
  CONSTRAINT fk_Detalle_prestamo_Prestamo
    FOREIGN KEY (idPrestamo) REFERENCES prestamo(idPrestamo)
    ON UPDATE CASCADE
    ON DELETE CASCADE,
  CONSTRAINT fk_Detalle_prestamo_elemento
    FOREIGN KEY (idelemento) REFERENCES elemento(idelemento)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: novedades_prestamos
-- -----------------------------------------------------
CREATE TABLE novedades_prestamos (
  idNovedades INT AUTO_INCREMENT PRIMARY KEY,
  idPrestamo INT NOT NULL,
  tipo_novedad ENUM('Daño', 'Perdida') NULL,
  Desripcion MEDIUMTEXT NULL,
  CONSTRAINT fk_Novedades_Prestamo
    FOREIGN KEY (idPrestamo) REFERENCES prestamo(idPrestamo)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: novedad_elemento
-- -----------------------------------------------------
CREATE TABLE novedad_elemento (
  idnovedad_elemento INT AUTO_INCREMENT PRIMARY KEY,
  idelemento INT NOT NULL,
  tipo_novedad ENUM('Daño', 'Perdida') NULL,
  novedad MEDIUMTEXT NULL,
  Cantidad_afectada SMALLINT NULL,
  CONSTRAINT fk_novedad_elemento_elemento
    FOREIGN KEY (idelemento) REFERENCES elemento(idelemento)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: escenario
-- -----------------------------------------------------
CREATE TABLE escenario (
  idEscenario INT AUTO_INCREMENT PRIMARY KEY,
  nombre_escenario VARCHAR(100) NOT NULL,
  descripcion TEXT NULL,
  ubicacion VARCHAR(150) NULL,
  capacidad_maxima INT NULL,
  estado VARCHAR(20) NOT NULL,
  horario_disponibilidad VARCHAR(255) NULL,
  observaciones TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Tabla: reserva
-- -----------------------------------------------------
CREATE TABLE reserva (
  idReserva INT AUTO_INCREMENT PRIMARY KEY,
  idEscenario INT NOT NULL,
  idUsuario INT NOT NULL,
  fecha_reserva DATE NOT NULL,
  hora_inicio TIME NOT NULL,
  hora_fin TIME NOT NULL,
  estado_reserva VARCHAR(20) NOT NULL,
  observaciones TEXT NULL,
  CONSTRAINT fk_reserva_escenario
    FOREIGN KEY (idEscenario) REFERENCES escenario(idEscenario)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,
  CONSTRAINT fk_reserva_usuario
    FOREIGN KEY (idUsuario) REFERENCES usuario(idUsuario)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_spanish_ci;

-- -----------------------------------------------------
-- Relaciones adicionales opcionales
-- -----------------------------------------------------
ALTER TABLE prestamo
  ADD CONSTRAINT fk_prestamo_escenario
  FOREIGN KEY (idEscenario) REFERENCES escenario(idEscenario)
  ON UPDATE CASCADE
  ON DELETE SET NULL;

-- -----------------------------------------------------
-- DATOS INICIALES
-- -----------------------------------------------------

-- Usuarios
INSERT INTO usuario (nombre_usuario, apellido_usuario, documento, correo, telefono, tipo_usuario, estado, observaciones) VALUES
('Juan', 'Pérez', '1001', 'juan@correo.com', '3001111111', 'Instructor', 'activo', 'Usuario principal'),
('María', 'Gómez', '1002', 'maria@correo.com', '3002222222', 'Instructor', 'activo', NULL),
('Carlos', 'Ramírez', '1003', 'carlos@correo.com', '3003333333', 'Almacenista', 'activo', NULL),
('Laura', 'Torres', '1004', 'laura@correo.com', '3004444444', 'Externo', 'activo', NULL);

-- Categorías
INSERT INTO categoria (categoria) VALUES
('Balones'),
('Petos'),
('Conos'),
('Redes'),
('Implementos varios');

-- Subcategorías
INSERT INTO subcategoria (idcategoria, subcategoria) VALUES
(1, 'Fútbol'),
(1, 'Baloncesto'),
(2, 'Entrenamiento'),
(3, 'Señalización'),
(4, 'Cancha'),
(5, 'General');

-- Items
INSERT INTO item (idsubcategoria, nombre_item, descripcion, estado, cantidad_total, cantidad_disponible, cantidad_prestada, fotografia, observaciones) VALUES
(1, 'Balón de fútbol', 'Balón para entrenamiento y competencia', 'activo', 10, 8, 2, 'balon_futbol.jpg', NULL),
(2, 'Balón de baloncesto', 'Balón oficial de baloncesto', 'activo', 6, 4, 2, 'balon_basket.jpg', NULL),
(3, 'Peto rojo', 'Peto de entrenamiento color rojo', 'activo', 20, 15, 5, 'peto_rojo.jpg', NULL),
(3, 'Peto azul', 'Peto de entrenamiento color azul', 'activo', 20, 18, 2, 'peto_azul.jpg', NULL),
(4, 'Cono naranja', 'Cono de señalización', 'activo', 30, 25, 5, 'cono_naranja.jpg', NULL),
(5, 'Red deportiva', 'Red para cancha', 'activo', 4, 3, 1, 'red_deportiva.jpg', NULL);

-- Elementos
INSERT INTO elemento (idItem, nombre_elemento, estado, observaciones) VALUES
(1, 'Balón 1', 'disponible', NULL),
(1, 'Balón 2', 'prestado', NULL),
(3, 'Peto rojo 1', 'prestado', NULL),
(4, 'Peto azul 1', 'disponible', NULL),
(5, 'Cono 1', 'disponible', NULL);

-- Escenarios
INSERT INTO escenario (nombre_escenario, descripcion, ubicacion, capacidad_maxima, estado, horario_disponibilidad, observaciones) VALUES
('Cancha Principal', 'Cancha para actividades deportivas generales', 'Sede central', 30, 'activo', 'Lunes a viernes 08:00-18:00', NULL),
('Gimnasio', 'Espacio cubierto para entrenamientos', 'Bloque deportivo', 50, 'activo', 'Lunes a viernes 07:00-20:00', NULL),
('Cancha Auxiliar', 'Espacio secundario para prácticas', 'Parte posterior', 20, 'activo', 'Lunes a sábado 08:00-17:00', 'Uso con reserva');

-- Préstamos
INSERT INTO prestamo (idUsuario, fecha_entrega, fecha_Devolucion, Hora_entrega, hora_devolucion, estado, Prestamocol, tipo_prestamo, observaciones, salida_fuera_campus, prestamo_externo, idEscenario) VALUES
(1, '2026-05-01', '2026-05-01', '08:00:00', '10:00:00', 'activo', 'Prestamo de entrenamiento', 'material', 'Préstamo para entrenamiento', FALSE, FALSE, NULL),
(2, '2026-05-02', '2026-05-02', '09:00:00', '11:00:00', 'devuelto', 'Prestamo escolar', 'material', 'Préstamo escolar', FALSE, FALSE, NULL),
(3, '2026-05-03', '2026-05-03', '14:00:00', '16:00:00', 'activo', 'Uso de cancha', 'escenario', 'Préstamo de escenario', FALSE, FALSE, 1);

-- Detalle préstamos
INSERT INTO detalle_prestamo (idPrestamo, idelemento, cantidad_solicitada, cantidad_entregada, cantidad_devuelta, cantidad_dañada, cantidad_faltante) VALUES
(1, 1, 2, 2, 0, 0, 0),
(1, 3, 1, 1, 0, 0, 0),
(2, 4, 2, 2, 2, 0, 0),
(2, 5, 1, 1, 1, 0, 0);

-- Novedades préstamos
INSERT INTO novedades_prestamos (idPrestamo, tipo_novedad, Desripcion) VALUES
(1, 'Daño', 'Uno de los elementos fue reportado con daño menor'),
(2, 'Perdida', 'Se reporta pérdida de un cono');

-- Novedad elemento
INSERT INTO novedad_elemento (idelemento, tipo_novedad, novedad, Cantidad_afectada) VALUES
(2, 'Daño', 'El balón presenta desgaste en la cubierta', 1),
(5, 'Perdida', 'No fue devuelto al finalizar el préstamo', 1);

-- Reservas
INSERT INTO reserva (idEscenario, idUsuario, fecha_reserva, hora_inicio, hora_fin, estado_reserva, observaciones) VALUES
(1, 1, '2026-05-04', '14:00:00', '16:00:00', 'pendiente', 'Reserva para entrenamiento'),
(2, 2, '2026-05-05', '08:00:00', '10:00:00', 'aprobada', 'Actividad académica');

-- -----------------------------------------------------
-- Fin del script
-- -----------------------------------------------------