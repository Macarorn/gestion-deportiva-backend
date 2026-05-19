import { NextFunction, Request, Response } from "express";
import { z } from "zod";

export const validateBody =
  (schema: z.ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
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
