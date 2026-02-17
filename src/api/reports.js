import { http } from './httpClient.js';

/**
 * GET /reports/informe?date_from=YYYY-MM-DD&date_to=YYYY-MM-DD
 * @param {{ date_from: string, date_to: string }} params - Fechas en YYYY-MM-DD
 * @returns {Promise<object>} data del informe
 */
export async function getInforme(params) {
  const dateFrom = (params.date_from ?? '').trim();
  const dateTo = (params.date_to ?? '').trim();
  if (!dateFrom || !dateTo) throw new Error('date_from y date_to son obligatorios');
  const searchParams = new URLSearchParams({ date_from: dateFrom, date_to: dateTo });
  const response = await http.get(`/reports/informe?${searchParams}`);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al generar el informe');
  }

  return response.data;
}
