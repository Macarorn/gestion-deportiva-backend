"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const elementos_controller_1 = require("../controllers/elementos.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * GET /api/elementos
 * Obtener todos los elementos
 */
router.get("/", auth_middleware_1.authenticate, elementos_controller_1.getAllElementos);
/**
 * GET /api/elementos/:id
 * Obtener un elemento por ID
 */
router.get("/:id", auth_middleware_1.authenticate, elementos_controller_1.getElementoById);
/**
 * GET /api/materiales/:materialId/elementos
 * Obtener elementos de un material específico
 */
router.get("/material/:materialId", auth_middleware_1.authenticate, elementos_controller_1.getElementosByMaterial);
/**
 * GET /api/elementos/estado/:estado
 * Obtener elementos por estado (disponible, prestado, dañado, perdido)
 */
router.get("/estado/:estado", auth_middleware_1.authenticate, elementos_controller_1.getElementosByEstado);
/**
 * POST /api/elementos
 * Crear un nuevo elemento
 * Requiere: Administrador, Almacenista
 */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), elementos_controller_1.createElemento);
/**
 * PUT /api/elementos/:id
 * Actualizar un elemento
 * Requiere: Administrador, Almacenista
 */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), elementos_controller_1.updateElemento);
/**
 * DELETE /api/elementos/:id
 * Eliminar un elemento
 * Requiere: Administrador
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador"]), elementos_controller_1.deleteElemento);
exports.default = router;
