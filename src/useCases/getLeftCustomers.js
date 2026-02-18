import { CustomerService } from '../services/CustomerService.js';

/**
 * Caso de uso: obtener clientes dados de baja (GET /customers/left).
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ message: string, data: object[] }>}
 */
export async function getLeftCustomers(options = {}) {
  return CustomerService.getLeft(options);
}
