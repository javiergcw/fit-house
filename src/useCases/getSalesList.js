import { SaleService } from '../services/SaleService.js';

/**
 * Caso de uso: obtener el listado paginado de ventas.
 * @param {{ page?: number, limit?: number }} [params]
 * @returns {Promise<{ data: Array<object>, pagination: object }>}
 */
export async function getSalesList(params = {}) {
  return SaleService.getSales(params);
}
