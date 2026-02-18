import { getExpiredCustomerMemberships } from '../api/customerMemberships.js';

/**
 * Caso de uso: listar membresías expiradas.
 * @param {{ page?: number, limit?: number, customer_status?: 'all'|'active'|'inactive' }} [params]
 *   - customer_status: 'all' = todas, 'active' = solo clientes activos, 'inactive' = solo personas idas
 * @returns {Promise<{ data: Array<object>, pagination: object }>}
 */
export async function getExpiredMemberships(params = {}) {
  return getExpiredCustomerMemberships(params);
}
