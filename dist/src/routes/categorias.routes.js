"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const categorias_controller_1 = require("../controllers/categorias.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * GET /api/categorias
 * Obtener todas las categorías
 */
router.get("/", auth_middleware_1.authenticate, categorias_controller_1.getAllCategorias);
/**
 * GET /api/categorias/:id
 * Obtener una categoría por ID
 */
router.get("/:id", auth_middleware_1.authenticate, categorias_controller_1.getCategoriaById);
/**
 * POST /api/categorias
 * Crear una nueva categoría
 * Requiere: Administrador, Almacenista
 */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), categorias_controller_1.createCategoria);
/**
 * PUT /api/categorias/:id
 * Actualizar una categoría
 * Requiere: Administrador, Almacenista
 */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), categorias_controller_1.updateCategoria);
/**
 * DELETE /api/categorias/:id
 * Eliminar una categoría
 * Requiere: Administrador
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador"]), categorias_controller_1.deleteCategoria);
exports.default = router;
