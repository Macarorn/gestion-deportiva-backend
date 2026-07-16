/**
 * Convierte un string "YYYY-MM-DD" a un objeto Date en hora LOCAL
 * (medianoche local). Evita el bug de `new Date("YYYY-MM-DD")` que
 * interpreta la fecha como UTC y la corre un día en zonas negativas.
 */
export function dateFromISO(fecha: string): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Final del día local (23:59:59.999) para filtros "hasta" inclusive.
 */
export function endOfDayFromISO(fecha: string): Date {
  const [y, m, d] = fecha.split("-").map(Number);
  return new Date(y, m - 1, d, 23, 59, 59, 999);
}
