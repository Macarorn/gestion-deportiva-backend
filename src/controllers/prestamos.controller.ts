import { Request, Response } from "express";
import { ZodError } from "zod";
import { prisma } from "../lib/prisma";
import {
  createPrestamoSchema,
  activarPrestamoSchema,
  devolverPrestamoSchema,
  cancelarPrestamoSchema,
  getPrestamosSchema,
  getPrestamoByIdSchema,
} from "../schemas/prestamo.schema";

/**
 * Genera número de préstamo en formato PRE-YYYY-MM-NNN
 */
async function generateNumeroPrestamo(): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  
  // Contar préstamos del mes actual
  const count = await prisma.prestamo.count({
    where: {
      createdAt: {
        gte: new Date(year, now.getMonth(), 1),
        lt: new Date(year, now.getMonth() + 1, 1),
      },
    },
  });
  
  const sequence = String(count + 1).padStart(3, "0");
  return `PRE-${year}-${month}-${sequence}`;
}

/**
 * POST /api/prestamos
 * Crear nuevo préstamo (estado: pendiente)
 */
export const createPrestamo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = createPrestamoSchema.parse(req.body);
    const usuarioSolicitanteId = req.user?.id;

    // Verificar que existe el usuario destino
    const usuario = await prisma.usuario.findUnique({
      where: { id: data.usuarioId },
    });

    if (!usuario) {
      res.status(404).json({
        success: false,
        error: "Usuario destino no encontrado",
      });
      return;
    }

    // Verificar cada material
    for (const detalle of data.detalles) {
      const material = await prisma.material.findUnique({
        where: { id: detalle.materialId },
      });

      if (!material) {
        res.status(404).json({
          success: false,
          error: `Material con ID ${detalle.materialId} no encontrado`,
        });
        return;
      }

      // Validar cantidad disponible
      if (detalle.cantidad_solicitada > material.cantidad_disponible) {
        res.status(400).json({
          success: false,
          error: `La cantidad solicitada para el material "${material.nombre}" (${detalle.cantidad_solicitada}) excede la disponibilidad actual (${material.cantidad_disponible})`,
        });
        return;
      }

      // Si tiene elementoId, verificar que existe
      if (detalle.elementoId) {
        const elemento = await prisma.elemento.findUnique({
          where: { id: detalle.elementoId },
        });

        if (!elemento) {
          res.status(404).json({
            success: false,
            error: `Elemento con ID ${detalle.elementoId} no encontrado`,
          });
          return;
        }

        if (elemento.materialId !== detalle.materialId) {
          res.status(400).json({
            success: false,
            error: "El elemento no pertenece al material especificado",
          });
          return;
        }
      }
    }

    // Generar número de préstamo
    const numero_prestamo = await generateNumeroPrestamo();

    // Crear préstamo con transacción
    const prestamo = await prisma.prestamo.create({
      data: {
        numero_prestamo,
        usuarioId: data.usuarioId,
        usuarioSolicitanteId: usuarioSolicitanteId,
        aprendizId: data.aprendizId,
        estado: "pendiente",
        fecha_prestamo: new Date(data.fecha_prestamo),
        fecha_devolucion_esperada: new Date(data.fecha_devolucion_esperada),
        hora_entrega: data.hora_entrega ? new Date(data.hora_entrega) : null,
        observaciones: data.observaciones,
        prestamodetalle: {
          create: data.detalles.map((detalle) => ({
            materialId: detalle.materialId,
            elementoId: detalle.elementoId,
            cantidad_solicitada: detalle.cantidad_solicitada,
            observaciones: detalle.observaciones,
          })),
        },
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            tipo_usuario: true,
          },
        },
        usuario_solicitante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            tipo_usuario: true,
          },
        },
        prestamodetalle: {
          include: {
            material: {
              include: {
                subcategoria: {
                  include: {
                    categoria: true,
                  },
                },
              },
            },
            elemento: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: prestamo,
      message: "Préstamo creado exitosamente",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en createPrestamo:", error);
    res.status(500).json({
      success: false,
      error: "Error al crear préstamo",
    });
  }
};

/**
 * PUT /api/prestamos/:id/activar
 * Activar préstamo (pendiente -> activo) y descontar inventario
 */
export const activarPrestamo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getPrestamoByIdSchema.parse({ id: parseInt(String(req.params.id)) });
    const data = activarPrestamoSchema.parse(req.body);

    // Verificar que existe el préstamo
    const prestamo = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        prestamodetalle: {
          include: {
            material: true,
            elemento: true,
          },
        },
      },
    });

    if (!prestamo) {
      res.status(404).json({
        success: false,
        error: "Préstamo no encontrado",
      });
      return;
    }

    // Verificar estado
    if (prestamo.estado !== "pendiente") {
      res.status(400).json({
        success: false,
        error: "Solo se pueden activar préstamos en estado pendiente",
      });
      return;
    }

    // Validar cantidades y verificar inventario
    const elementosAsignados: Record<number, number> = {}; // Map detalle_id -> elemento_id
    
    for (const detalleData of data.detalles) {
      const detalle = prestamo.prestamodetalle.find((d) => d.id === detalleData.detalle_id);
      
      if (!detalle) {
        res.status(400).json({
          success: false,
          error: `Detalle con ID ${detalleData.detalle_id} no encontrado`,
        });
        return;
      }

      if (detalleData.cantidad_entregada > detalle.cantidad_solicitada) {
        res.status(400).json({
          success: false,
          error: "Cantidad entregada no puede exceder la cantidad solicitada",
        });
        return;
      }

      // Verificar inventario disponible
      if (detalle.elemento) {
        // Tiene serial - verificar estado
        if (detalle.elemento.estado !== "disponible") {
          // Si no está disponible, buscar otro disponible del mismo material
          const elementoDisponible = await prisma.elemento.findFirst({
            where: {
              materialId: detalle.materialId,
              estado: "disponible",
            },
          });
          
          if (!elementoDisponible) {
            res.status(400).json({
              success: false,
              error: `No hay elementos disponibles para ${detalle.material.nombre}. El elemento seleccionado ${detalle.elemento.nombre_serial} ya no está disponible y no hay otros disponibles.`,
            });
            return;
          }
          
          // Asignar el elemento disponible
          elementosAsignados[detalle.id] = elementoDisponible.id;
        } else {
          // Está disponible, usar el mismo
          elementosAsignados[detalle.id] = detalle.elemento.id;
        }
      } else {
        // Sin serial - verificar cantidad disponible
        if (detalleData.cantidad_entregada > detalle.material.cantidad_disponible) {
          res.status(400).json({
            success: false,
            error: `No hay suficiente inventario disponible para ${detalle.material.nombre}. Disponible: ${detalle.material.cantidad_disponible}, Solicitado: ${detalleData.cantidad_entregada}`,
          });
          return;
        }
      }
    }

    // Ejecutar transacción
    const prestamoActualizado = await prisma.$transaction(async (tx) => {
      // Actualizar cada detalle
      for (const detalleData of data.detalles) {
        const detalle = prestamo.prestamodetalle.find((d) => d.id === detalleData.detalle_id);
        
        if (!detalle) continue;

        // Actualizar cantidad entregada
        await tx.prestamodetalle.update({
          where: { id: detalle.id },
          data: {
            cantidad_entregada: detalleData.cantidad_entregada,
            elementoId: elementosAsignados[detalle.id] || detalle.elementoId,
          },
        });

        const elementoId = elementosAsignados[detalle.id] || detalle.elementoId;

        if (elementoId) {
          // Tiene serial - cambiar estado a prestado
          await tx.elemento.update({
            where: { id: elementoId },
            data: { estado: "prestado" },
          });

          // Recalcular cantidades del material
          const elementos = await tx.elemento.findMany({
            where: { materialId: detalle.materialId },
          });

          const cantidad_total = elementos.length;
          const cantidad_disponible = elementos.filter((e) => e.estado === "disponible").length;
          const cantidad_prestada = elementos.filter((e) => e.estado === "prestado").length;
          const cantidad_danada = elementos.filter((e) => e.estado === "dañado").length;
          const cantidad_mantenimiento = elementos.filter((e) => e.estado === "mantenimiento").length;

          await tx.material.update({
            where: { id: detalle.materialId },
            data: {
              cantidad_total,
              cantidad_disponible,
              cantidad_prestada,
              cantidad_danada,
              cantidad_mantenimiento,
            },
          });
        } else {
          // Sin serial - actualizar cantidades del material
          await tx.material.update({
            where: { id: detalle.materialId },
            data: {
              cantidad_disponible: {
                decrement: detalleData.cantidad_entregada,
              },
              cantidad_prestada: {
                increment: detalleData.cantidad_entregada,
              },
            },
          });
        }
      }

      // Actualizar préstamo
      const updated = await tx.prestamo.update({
        where: { id },
        data: {
          estado: "activo",
          fecha_prestamo: prestamo.fecha_prestamo || new Date(),
          hora_entrega: prestamo.hora_entrega || new Date(),
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              tipo_usuario: true,
            },
          },
          usuario_solicitante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              tipo_usuario: true,
            },
          },
          prestamodetalle: {
            include: {
              material: {
                include: {
                  subcategoria: {
                    include: {
                      categoria: true,
                    },
                  },
                },
              },
              elemento: true,
            },
          },
        },
      });

      return updated;
    });

    res.status(200).json({
      success: true,
      data: prestamoActualizado,
      message: "Préstamo activado exitosamente",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en activarPrestamo:", error);
    res.status(500).json({
      success: false,
      error: "Error al activar préstamo",
    });
  }
};

/**
 * PUT /api/prestamos/:id/devolver
 * Devolver préstamo (activo -> devuelto) con novedades
 */
export const devolverPrestamo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getPrestamoByIdSchema.parse({ id: parseInt(String(req.params.id)) });
    const data = devolverPrestamoSchema.parse(req.body);

    // Verificar que existe el préstamo
    const prestamo = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        prestamodetalle: {
          include: {
            material: true,
            elemento: true,
          },
        },
      },
    });

    if (!prestamo) {
      res.status(404).json({
        success: false,
        error: "Préstamo no encontrado",
      });
      return;
    }

    // Verificar estado
    if (prestamo.estado !== "activo") {
      res.status(400).json({
        success: false,
        error: "Solo se pueden devolver préstamos en estado activo",
      });
      return;
    }

    // Validar cantidades
    for (const detalleData of data.detalles) {
      const detalle = prestamo.prestamodetalle.find((d) => d.id === detalleData.detalle_id);
      
      if (!detalle) {
        res.status(400).json({
          success: false,
          error: `Detalle con ID ${detalleData.detalle_id} no encontrado`,
        });
        return;
      }

      const totalDevuelto = detalleData.cantidad_devuelta + detalleData.cantidad_danada + detalleData.cantidad_faltante;
      
      if (totalDevuelto > detalle.cantidad_entregada) {
        res.status(400).json({
          success: false,
          error: "La suma de cantidades devueltas no puede exceder la cantidad entregada",
        });
        return;
      }

      // Validar que el elemento devuelto coincida con el prestado (para materiales con serial)
      if (detalle.elemento && detalleData.elementoId) {
        if (detalleData.elementoId !== detalle.elemento.id) {
          const elementoDevuelto = await prisma.elemento.findUnique({
            where: { id: detalleData.elementoId },
          });

          if (!elementoDevuelto || elementoDevuelto.materialId !== detalle.materialId) {
            res.status(400).json({
              success: false,
              error: `El elemento a devolver no pertenece al material ${detalle.material.nombre}`,
            });
            return;
          }

          if (elementoDevuelto.estado !== "prestado") {
            res.status(400).json({
              success: false,
              error: `El elemento ${elementoDevuelto.nombre_serial} no está prestado actualmente`,
            });
            return;
          }
        }
      }
    }

    // Ejecutar transacción
    const prestamoActualizado = await prisma.$transaction(async (tx) => {
      // Procesar cada detalle
      for (const detalleData of data.detalles) {
        const detalle = prestamo.prestamodetalle.find((d) => d.id === detalleData.detalle_id);
        
        if (!detalle) continue;

        // Actualizar detalle
        await tx.prestamodetalle.update({
          where: { id: detalle.id },
          data: {
            cantidad_devuelta: detalleData.cantidad_devuelta,
            cantidad_danada: detalleData.cantidad_danada,
            cantidad_faltante: detalleData.cantidad_faltante,
          },
        });

        // Crear novedades si existen
        if (detalleData.novedades && detalleData.novedades.length > 0) {
          for (const novedad of detalleData.novedades) {
            await tx.novedad.create({
              data: {
                prestamoId: id,
                tipo: novedad.tipo,
                descripcion: novedad.descripcion,
                cantidad_afectada: novedad.cantidad_afectada,
                elementoId: novedad.elementoId,
              },
            });

            // Si la novedad tiene elementoId, actualizar el estado del elemento según el tipo
            if (novedad.elementoId) {
              if (novedad.tipo === "pérdida") {
                await tx.elemento.update({
                  where: { id: novedad.elementoId },
                  data: { estado: "faltante" },
                });
              } else if (novedad.tipo === "daño") {
                await tx.elemento.update({
                  where: { id: novedad.elementoId },
                  data: { estado: "dañado" },
                });
              }
            }
          }
        }

        // Recalcular inventario
        const elementoId = detalleData.elementoId || detalle.elementoId;

        if (elementoId) {
          // Tiene serial - actualizar estado del elemento si no hay novedad
          const tieneNovedad = detalleData.novedades?.some(n => n.elementoId === elementoId);
          if (!tieneNovedad) {
            // Si no hay novedad para este elemento, marcarlo como disponible
            await tx.elemento.update({
              where: { id: elementoId },
              data: { estado: "disponible" },
            });
          }

          // Recalcular cantidades del material
          const elementos = await tx.elemento.findMany({
            where: { materialId: detalle.materialId },
          });

          const cantidad_total = elementos.length;
          const cantidad_disponible = elementos.filter((e) => e.estado === "disponible").length;
          const cantidad_prestada = elementos.filter((e) => e.estado === "prestado").length;
          const cantidad_danada = elementos.filter((e) => e.estado === "dañado").length;
          const cantidad_mantenimiento = elementos.filter((e) => e.estado === "mantenimiento").length;
          const cantidad_faltante = elementos.filter((e) => e.estado === "faltante").length;

          await tx.material.update({
            where: { id: detalle.materialId },
            data: {
              cantidad_total,
              cantidad_disponible,
              cantidad_prestada,
              cantidad_danada,
              cantidad_mantenimiento,
              cantidad_faltante,
            },
          });
        } else {
          // Sin serial
          await tx.material.update({
            where: { id: detalle.materialId },
            data: {
              cantidad_disponible: {
                increment: detalleData.cantidad_devuelta,
              },
              cantidad_prestada: {
                decrement: detalleData.cantidad_devuelta,
              },
              cantidad_danada: {
                increment: detalleData.cantidad_danada,
              },
              cantidad_faltante: {
                increment: detalleData.cantidad_faltante,
              },
            },
          });
        }
      }

      // Actualizar préstamo
      const updated = await tx.prestamo.update({
        where: { id },
        data: {
          estado: "devuelto",
          fecha_devolucion_real: new Date(),
          hora_devolucion: new Date(),
          observaciones: data.observaciones || prestamo.observaciones,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              tipo_usuario: true,
            },
          },
          usuario_solicitante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              tipo_usuario: true,
            },
          },
          prestamodetalle: {
            include: {
              material: {
                include: {
                  subcategoria: {
                    include: {
                      categoria: true,
                    },
                  },
                },
              },
              elemento: true,
            },
          },
          novedad: true,
        },
      });

      return updated;
    });

    res.status(200).json({
      success: true,
      data: prestamoActualizado,
      message: "Préstamo devuelto exitosamente",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en devolverPrestamo:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
    res.status(500).json({
      success: false,
      error: "Error al devolver préstamo",
      details: error instanceof Error ? error.message : String(error),
    });
  }
};

/**
 * PUT /api/prestamos/:id/cancelar
 * Cancelar préstamo (pendiente/activo -> cancelado)
 */
export const cancelarPrestamo = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getPrestamoByIdSchema.parse({ id: parseInt(String(req.params.id)) });
    const data = cancelarPrestamoSchema.parse(req.body);

    // Verificar que existe el préstamo
    const prestamo = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        prestamodetalle: {
          include: {
            material: true,
            elemento: true,
          },
        },
      },
    });

    if (!prestamo) {
      res.status(404).json({
        success: false,
        error: "Préstamo no encontrado",
      });
      return;
    }

    // Verificar estado
    if (!["pendiente", "activo"].includes(prestamo.estado)) {
      res.status(400).json({
        success: false,
        error: "Solo se pueden cancelar préstamos en estado pendiente o activo",
      });
      return;
    }

    // Ejecutar transacción
    const prestamoActualizado = await prisma.$transaction(async (tx) => {
      // Si está activo, devolver al inventario
      if (prestamo.estado === "activo") {
        for (const detalle of prestamo.prestamodetalle) {
          if (detalle.elemento) {
            // Tiene serial - cambiar estado a disponible
            await tx.elemento.update({
              where: { id: detalle.elemento.id },
              data: { estado: "disponible" },
            });

            // Recalcular cantidades del material
            const elementos = await tx.elemento.findMany({
              where: { materialId: detalle.materialId },
            });

            const cantidad_total = elementos.length;
            const cantidad_disponible = elementos.filter((e) => e.estado === "disponible").length;
            const cantidad_prestada = elementos.filter((e) => e.estado === "prestado").length;
            const cantidad_danada = elementos.filter((e) => e.estado === "dañado").length;
            const cantidad_mantenimiento = elementos.filter((e) => e.estado === "mantenimiento").length;

            await tx.material.update({
              where: { id: detalle.materialId },
              data: {
                cantidad_total,
                cantidad_disponible,
                cantidad_prestada,
                cantidad_danada,
                cantidad_mantenimiento,
              },
            });
          } else {
            // Sin serial - devolver cantidad entregada
            await tx.material.update({
              where: { id: detalle.materialId },
              data: {
                cantidad_disponible: {
                  increment: detalle.cantidad_entregada,
                },
                cantidad_prestada: {
                  decrement: detalle.cantidad_entregada,
                },
              },
            });
          }
        }
      }

      // Actualizar préstamo
      const updated = await tx.prestamo.update({
        where: { id },
        data: {
          estado: "cancelado",
          observaciones: data.motivo ? `${prestamo.observaciones || ""}\nCancelado: ${data.motivo}` : prestamo.observaciones,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              tipo_usuario: true,
            },
          },
          usuario_solicitante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              tipo_usuario: true,
            },
          },
          prestamodetalle: {
            include: {
              material: {
                include: {
                  subcategoria: {
                    include: {
                      categoria: true,
                    },
                  },
                },
              },
              elemento: true,
            },
          },
        },
      });

      return updated;
    });

    res.status(200).json({
      success: true,
      data: prestamoActualizado,
      message: "Préstamo cancelado exitosamente",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en cancelarPrestamo:", error);
    res.status(500).json({
      success: false,
      error: "Error al cancelar préstamo",
    });
  }
};

/**
 * GET /api/prestamos
 * Listar préstamos con filtros
 */
export const getPrestamos = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const params = getPrestamosSchema.parse(req.query);

    // Construir filtro where
    const where: any = {};

    if (params.estado) {
      where.estado = params.estado;
    }

    if (params.usuarioId) {
      where.usuarioId = params.usuarioId;
    }

    if (params.busqueda) {
      where.OR = [
        { numero_prestamo: { contains: params.busqueda } },
        { usuario: { nombre: { contains: params.busqueda } } },
        { usuario: { apellido: { contains: params.busqueda } } },
      ];
    }

    // Marcar préstamos vencidos
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    await prisma.prestamo.updateMany({
      where: {
        estado: "activo",
        fecha_devolucion_esperada: {
          lt: hoy,
        },
      },
      data: {
        estado: "vencido",
      },
    });

    // Calcular paginación
    const skip = (params.page - 1) * params.limit;

    // Obtener préstamos
    const [prestamos, total] = await Promise.all([
      prisma.prestamo.findMany({
        where,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              correo: true,
              tipo_usuario: true,
            },
          },
          usuario_solicitante: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              tipo_usuario: true,
            },
          },
          aprendiz: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              tipo_usuario: true,
            },
          },
          prestamodetalle: {
            include: {
              material: {
                select: {
                  id: true,
                  nombre: true,
                  requiere_serial: true,
                  cantidad_total: true,
                  cantidad_disponible: true,
                  cantidad_prestada: true,
                  cantidad_danada: true,
                  cantidad_mantenimiento: true,
                  subcategoria: {
                    select: {
                      id: true,
                      nombre: true,
                      categoria: {
                        select: {
                          id: true,
                          nombre: true,
                        },
                      },
                    },
                  },
                },
              },
              elemento: true,
            },
          },
          novedad: true,
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: params.limit,
      }),
      prisma.prestamo.count({ where }),
    ]);

    res.status(200).json({
      success: true,
      data: prestamos,
      total,
      page: params.page,
      limit: params.limit,
      totalPages: Math.ceil(total / params.limit),
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en getPrestamos:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener préstamos",
    });
  }
};

/**
 * GET /api/prestamos/:id
 * Obtener detalle de préstamo
 */
export const getPrestamoById = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = getPrestamoByIdSchema.parse({ id: parseInt(String(req.params.id)) });

    const prestamo = await prisma.prestamo.findUnique({
      where: { id },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            correo: true,
            telefono: true,
            tipo_usuario: true,
            ficha: true,
          },
        },
        usuario_solicitante: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo_usuario: true,
          },
        },
        aprendiz: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            tipo_usuario: true,
          },
        },
        prestamodetalle: {
          include: {
            material: {
              select: {
                id: true,
                nombre: true,
                cantidad_total: true,
                cantidad_disponible: true,
                cantidad_prestada: true,
                cantidad_danada: true,
                cantidad_mantenimiento: true,
                requiere_serial: true,
                subcategoria: {
                  include: {
                    categoria: true,
                  },
                },
              },
            },
            elemento: true,
          },
        },
        novedad: true,
      },
    });

    if (!prestamo) {
      res.status(404).json({
        success: false,
        error: "Préstamo no encontrado",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: prestamo,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({
        success: false,
        error: "Validación fallida",
        details: error.flatten(),
      });
      return;
    }

    console.error("Error en getPrestamoById:", error);
    res.status(500).json({
      success: false,
      error: "Error al obtener préstamo",
    });
  }
};
