import { CustomerService } from '../services/CustomerService.js';

/**
 * Caso de uso: obtener el listado paginado de customers.
 * @param {{ page?: number, limit?: number }} [params] - page (default 1), limit (default 10)
 * @returns {Promise<{ data: Array<object>, pagination: object }>}
 */
export async function getCustomersList(params = {}) {
  return CustomerService.getCustomers(params);
}
