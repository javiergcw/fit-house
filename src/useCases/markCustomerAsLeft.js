import { CustomerService } from '../services/CustomerService.js';

/**
 * Caso de uso: marcar un customer como persona dada de baja (PUT /customers/:id con marked_as_left: true).
 * @param {string} customerId - ID del customer
 * @returns {Promise<object>} Customer actualizado
 */
export async function markCustomerAsLeft(customerId) {
  if (!customerId?.trim()) throw new Error('ID de customer requerido');
  return CustomerService.update(customerId.trim(), { marked_as_left: true });
}
