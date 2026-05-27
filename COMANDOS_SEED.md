# Comandos para ejecutar el Seed de la Base de Datos

## Comando para ejecutar el seed (Windows)

```bash
npx ts-node prisma/seed.ts
```

O usando cmd:
```bash
cmd /c npx ts-node prisma/seed.ts
```

## Nota importante

El archivo seed.ts está en el directorio prisma/, no en src/, por lo que NO se compila con `npm run build`. Debes ejecutarlo directamente con ts-node.

## Información

Este seed configura la base de datos con:
- Usuarios de prueba (instructor, admin, almacenista)
- Categorías y subcategorías
- Materiales con `cantidad_prestada = 0` (los préstamos se gestionan a través del módulo de préstamos)
- Elementos en estado "disponible" (ninguno prestado por defecto)
