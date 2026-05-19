"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const usuarios_controller_1 = require("../controllers/usuarios.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const role_middleware_1 = require("../middleware/role.middleware");
const validate_middleware_1 = require("../middleware/validate.middleware");
const usuarios_schema_1 = require("../schemas/usuarios.schema");
const router = (0, express_1.Router)();
// Todas las rutas requieren autenticación y rol de Administrador
router.use(auth_middleware_1.requireAuth, (0, role_middleware_1.requireRole)(["Administrador"]));
/**
 * POST /usuarios
 * Crear nuevo usuario
 */
router.post("/", (0, validate_middleware_1.validateBody)(usuarios_schema_1.createUsuarioSchema), usuarios_controller_1.createUsuario);
/**
 * GET /usuarios
 * Obtener usuarios con filtros y paginación
 * Query params: busqueda, rol, estado, pagina, limit
 */
router.get("/", usuarios_controller_1.getUsuarios);
/**
 * GET /usuarios/:id
 * Obtener usuario por ID
 */
router.get("/:id", usuarios_controller_1.getUsuarioById);
/**
 * PUT /usuarios/:id
 * Actualizar usuario
 */
router.put("/:id", (0, validate_middleware_1.validateBody)(usuarios_schema_1.updateUsuarioSchema), usuarios_controller_1.updateUsuario);
/**
 * DELETE /usuarios/:id
 * Desactivar usuario (soft delete)
 */
router.delete("/:id", usuarios_controller_1.deleteUsuario);
exports.default = router;
