import { ReportService } from '../services/ReportService.js';

/**
 * Caso de uso: obtener informe de ventas por rango de fechas.
 * @param {string} dateFrom - YYYY-MM-DD
 * @param {string} dateTo - YYYY-MM-DD
 * @returns {Promise<object>} Informe normalizado
 */
export async function getReport(dateFrom, dateTo) {
  const from = (dateFrom ?? '').trim();
  const to = (dateTo ?? '').trim();
  if (!from || !to) throw new Error('Las fechas desde y hasta son obligatorias');
  return ReportService.getInforme(from, to);
}
