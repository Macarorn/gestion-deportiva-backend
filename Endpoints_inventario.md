# 📚 API de Inventario - Documentación de Endpoints

## 🔐 Autenticación Requerida

Todos los endpoints requieren token Bearer en el header:

```
Authorization: Bearer <token>
```

---

## 📁 CATEGORÍAS

### GET /api/categorias

**Descripción:** Obtener todas las categorías  
**Permisos:** Cualquier usuario autenticado  
**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "nombre": "Balones",
      "descripcion": "Balones deportivos",
      "estado": true,
      "subCategorias": [...]
    }
  ],
  "total": 4
}
```

### GET /api/categorias/:id

**Descripción:** Obtener categoría con todas sus subcategorías y materiales  
**Permisos:** Cualquier usuario autenticado  
**Parámetros:** `id` (number)

### POST /api/categorias

**Descripción:** Crear nueva categoría  
**Permisos:** Administrador, Almacenista  
**Body:**

```json
{
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción opcional",
  "estado": true
}
```

### PUT /api/categorias/:id

**Descripción:** Actualizar categoría  
**Permisos:** Administrador, Almacenista  
**Parámetros:** `id` (number)

### DELETE /api/categorias/:id

**Descripción:** Eliminar categoría (soft delete)  
**Permisos:** Administrador  
**Parámetros:** `id` (number)

---

## 📂 SUBCATEGORÍAS

### GET /api/subcategorias

**Descripción:** Obtener todas las subcategorías  
**Permisos:** Cualquier usuario autenticado

### GET /api/subcategorias/:id

**Descripción:** Obtener subcategoría con materiales  
**Permisos:** Cualquier usuario autenticado

### GET /api/subcategorias/categoria/:categoriaId

**Descripción:** Obtener subcategorías de una categoría específica  
**Permisos:** Cualquier usuario autenticado

### POST /api/subcategorias

**Descripción:** Crear subcategoría  
**Permisos:** Administrador, Almacenista  
**Body:**

```json
{
  "nombre": "Fútbol",
  "descripcion": "Descripción",
  "categoriaId": 1,
  "estado": true
}
```

### PUT /api/subcategorias/:id

**Descripción:** Actualizar subcategoría  
**Permisos:** Administrador, Almacenista

### DELETE /api/subcategorias/:id

**Descripción:** Eliminar subcategoría  
**Permisos:** Administrador

---

## 🛍️ MATERIALES

### GET /api/materiales

**Descripción:** Obtener todos los materiales  
**Permisos:** Cualquier usuario autenticado

### GET /api/materiales/:id

**Descripción:** Obtener material con elementos  
**Permisos:** Cualquier usuario autenticado

### GET /api/materiales/subcategoria/:subCategoriaId

**Descripción:** Obtener materiales de una subcategoría  
**Permisos:** Cualquier usuario autenticado

### POST /api/materiales

**Descripción:** Crear material  
**Permisos:** Administrador, Almacenista  
**Body:**

```json
{
  "nombre": "Balón de fútbol",
  "descripcion": "Balón profesional",
  "subCategoriaId": 1,
  "cantidad_total": 10,
  "cantidad_disponible": 8,
  "cantidad_prestada": 2,
  "estado": "activo",
  "fotografia": "url_imagen",
  "observaciones": "Stock actualizado"
}
```

### PUT /api/materiales/:id

**Descripción:** Actualizar material  
**Permisos:** Administrador, Almacenista

### DELETE /api/materiales/:id

**Descripción:** Eliminar material (solo si no hay préstamos)  
**Permisos:** Administrador

---

## 🏷️ ELEMENTOS (Seriales)

### GET /api/elementos

**Descripción:** Obtener todos los elementos  
**Permisos:** Cualquier usuario autenticado

### GET /api/elementos/:id

**Descripción:** Obtener elemento específico  
**Permisos:** Cualquier usuario autenticado

### GET /api/elementos/material/:materialId

**Descripción:** Obtener elementos de un material  
**Permisos:** Cualquier usuario autenticado

### GET /api/elementos/estado/:estado

**Descripción:** Obtener elementos por estado  
**Estados válidos:** `disponible`, `prestado`, `dañado`, `perdido`  
**Permisos:** Cualquier usuario autenticado

### POST /api/elementos

**Descripción:** Crear elemento (serial)  
**Permisos:** Administrador, Almacenista  
**Body:**

```json
{
  "materialId": 1,
  "nombre_serial": "Balón Fútbol #001",
  "estado": "disponible",
  "observaciones": "Observaciones opcionales"
}
```

### PUT /api/elementos/:id

**Descripción:** Actualizar elemento  
**Permisos:** Administrador, Almacenista

### DELETE /api/elementos/:id

**Descripción:** Eliminar elemento (solo si está disponible)  
**Permisos:** Administrador

---

## ✨ Características Implementadas

### Validación

- ✅ Zod schemas para todos los modelos
- ✅ Validación de tipos y rangos
- ✅ Mensajes de error descriptivos

### Relaciones

- ✅ Categoría → SubCategorías → Materiales → Elementos
- ✅ Inclusión automática de relaciones en respuestas
- ✅ Validación de referencias externas

### Control de Acceso

- ✅ Autenticación requerida en todos los endpoints
- ✅ Autorización por rol (Administrador, Almacenista, Instructor)
- ✅ Endpoints de lectura: Todos los usuarios
- ✅ Endpoints de escritura: Solo Administrador/Almacenista
- ✅ Endpoints de eliminación: Solo Administrador

### Lógica de Negocio

- ✅ Soft delete (estado=false) para Categorías y SubCategorías
- ✅ Validación de cantidades (disponible + prestada = total)
- ✅ Prevención de eliminación si hay items prestados
- ✅ Serial único por material
- ✅ Nombre único por categoría
- ✅ Nombre único por subcategoría en la misma categoría

### Estados de Material y Elemento

- **Material:** `activo`, `inactivo`, `mantenimiento`
- **Elemento:** `disponible`, `prestado`, `dañado`, `perdido`

---

## 🚀 Ejemplo de Flujo

1. **Crear Categoría**

   ```
   POST /api/categorias
   { "nombre": "Balones" }
   ```

2. **Crear SubCategoría**

   ```
   POST /api/subcategorias
   { "nombre": "Fútbol", "categoriaId": 1 }
   ```

3. **Crear Material**

   ```
   POST /api/materiales
   { "nombre": "Balón Pro", "subCategoriaId": 1, "cantidad_total": 5 }
   ```

4. **Crear Elemento**

   ```
   POST /api/elementos
   { "materialId": 1, "nombre_serial": "Balón #001" }
   ```

5. **Obtener Jerarquía Completa**
   ```
   GET /api/categorias/1
   ```
   Devuelve la categoría con todos sus subcategorías, materiales y elementos.
