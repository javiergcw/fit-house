import { CustomerService } from '../services/CustomerService.js';

/**
 * Caso de uso: obtener el detalle de un customer por ID.
 * @param {string} id - ID del customer
 * @param {{ signal?: AbortSignal }} [options] - signal para cancelar la petición
 * @returns {Promise<object|null>}
 * @throws {Error} Si el customer no existe o falla la petición
 */
export async function getCustomerDetail(id, options = {}) {
  if (!id?.trim()) throw new Error('ID de customer requerido');
  return CustomerService.getCustomerById(id.trim(), options);
}
