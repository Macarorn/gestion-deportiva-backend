"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subcategorias_controller_1 = require("../controllers/subcategorias.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const router = (0, express_1.Router)();
/**
 * GET /api/subcategorias
 * Obtener todas las subcategorías
 */
router.get("/", auth_middleware_1.authenticate, subcategorias_controller_1.getAllSubCategorias);
/**
 * GET /api/subcategorias/:id
 * Obtener una subcategoría por ID
 */
router.get("/:id", auth_middleware_1.authenticate, subcategorias_controller_1.getSubCategoriaById);
/**
 * GET /api/categorias/:categoriaId/subcategorias
 * Obtener subcategorías de una categoría específica
 */
router.get("/categoria/:categoriaId", auth_middleware_1.authenticate, subcategorias_controller_1.getSubCategoriasByCategoria);
/**
 * POST /api/subcategorias
 * Crear una nueva subcategoría
 * Requiere: Administrador, Almacenista
 */
router.post("/", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), subcategorias_controller_1.createSubCategoria);
/**
 * PUT /api/subcategorias/:id
 * Actualizar una subcategoría
 * Requiere: Administrador, Almacenista
 */
router.put("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador", "Almacenista"]), subcategorias_controller_1.updateSubCategoria);
/**
 * DELETE /api/subcategorias/:id
 * Eliminar una subcategoría
 * Requiere: Administrador
 */
router.delete("/:id", auth_middleware_1.authenticate, (0, role_middleware_1.authorize)(["Administrador"]), subcategorias_controller_1.deleteSubCategoria);
exports.default = router;
