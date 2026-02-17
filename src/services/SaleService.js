import { getSales as getSalesApi } from '../api/sales.js';
import { fromApi as saleFromApi } from '../models/Sale.js';
import { fromApi as paginationFromApi } from '../models/Pagination.js';

/**
 * Servicio de ventas. GET /sales
 */
export const SaleService = {
  /**
   * Obtiene el listado paginado de ventas.
   * @param {{ page?: number, limit?: number }} [params]
   * @returns {Promise<{ data: Array<object>, pagination: object }>}
   */
  async getSales(params = {}) {
    const result = await getSalesApi(params);
    return {
      data: (result.data ?? []).map(saleFromApi).filter(Boolean),
      pagination: paginationFromApi(result.pagination),
    };
  },
};
