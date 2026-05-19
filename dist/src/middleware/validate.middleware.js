"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = void 0;
const validateBody = (schema) => (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: "Datos de entrada invalidos",
            errors: result.error.flatten(),
        });
    }
    req.body = result.data;
    return next();
};
exports.validateBody = validateBody;
