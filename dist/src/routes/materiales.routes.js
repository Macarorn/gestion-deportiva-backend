"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const materiales_controller_1 = require("../controllers/materiales.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * GET /api/materiales
 * Obtener todos los materiales
 */
router.get("/", auth_middleware_1.authenticate, materiales_controller_1.getAllMateriales);
/**
 * GET /api/materiales/:id
 * Obtener un material por ID
 */
router.get("/:id", auth_middleware_1.authenticate, materiales_controller_1.getMaterialById);
/**
 * GET /api/subcategorias/:subCategoriaId/materiales
 * Obtener materiales de una subcategoría específica
 */
router.get("/subcategoria/:subCategoriaId", auth_middleware_1.authenticate, materiales_controller_1.getMaterialesBySubCategoria);
/**
 * POST /api/materiales
 * Crear un nuevo material
 * Requiere: Administrador, Almacenista
 */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), materiales_controller_1.createMaterial);
/**
 * PUT /api/materiales/:id
 * Actualizar un material
 * Requiere: Administrador, Almacenista
 */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), materiales_controller_1.updateMaterial);
/**
 * DELETE /api/materiales/:id
 * Eliminar un material
 * Requiere: Administrador
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador"]), materiales_controller_1.deleteMaterial);
exports.default = router;
