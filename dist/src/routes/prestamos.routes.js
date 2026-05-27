"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prestamos_controller_1 = require("../controllers/prestamos.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const prestamo_schema_1 = require("../schemas/prestamo.schema");
const router = (0, express_1.Router)();
/**
 * POST /api/prestamos
 * Crear nuevo préstamo (estado: pendiente)
 * Requiere: Administrador, Almacenista, Instructor
 */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista", "Instructor"]), (0, validate_middleware_1.validateBody)(prestamo_schema_1.createPrestamoSchema), prestamos_controller_1.createPrestamo);
/**
 * GET /api/prestamos
 * Listar préstamos con filtros
 * Requiere: Autenticado
 */
router.get("/", auth_middleware_1.authenticate, prestamos_controller_1.getPrestamos);
/**
 * GET /api/prestamos/:id
 * Obtener detalle de préstamo
 * Requiere: Autenticado
 */
router.get("/:id", auth_middleware_1.authenticate, prestamos_controller_1.getPrestamoById);
/**
 * PUT /api/prestamos/:id/activar
 * Activar préstamo (pendiente -> activo) y descontar inventario
 * Requiere: Administrador, Almacenista
 */
router.put("/:id/activar", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), (0, validate_middleware_1.validateBody)(prestamo_schema_1.activarPrestamoSchema), prestamos_controller_1.activarPrestamo);
/**
 * PUT /api/prestamos/:id/devolver
 * Devolver préstamo (activo -> devuelto) con novedades
 * Requiere: Administrador, Almacenista, Instructor
 */
router.put("/:id/devolver", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista", "Instructor"]), (0, validate_middleware_1.validateBody)(prestamo_schema_1.devolverPrestamoSchema), prestamos_controller_1.devolverPrestamo);
/**
 * PUT /api/prestamos/:id/cancelar
 * Cancelar préstamo (pendiente/activo -> cancelado)
 * Requiere: Administrador, Almacenista
 */
router.put("/:id/cancelar", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), (0, validate_middleware_1.validateBody)(prestamo_schema_1.cancelarPrestamoSchema), prestamos_controller_1.cancelarPrestamo);
exports.default = router;
