import { http } from './httpClient.js';

/**
 * GET /customers/:id/memberships
 * @param {string} customerId - ID del customer
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ current_membership: object|null, memberships: object[] }>}
 */
export async function getCustomerMemberships(customerId, options = {}) {
  if (!customerId) throw new Error('ID de customer requerido');
  const { signal, ...rest } = options;
  const response = await http.get(`/customers/${encodeURIComponent(customerId)}/memberships`, { signal, ...rest });

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al obtener membresías del customer');
  }

  return response.data;
}

/**
 * POST /customer-memberships
 * @param {object} payload - { customer_id: string, membership_id: string }
 * @returns {Promise<object>} Respuesta del backend
 */
export async function createCustomerMembership(payload) {
  const response = await http.post('/customer-memberships', payload);

  if (!response.success) {
    throw new Error(response.message || 'Error al asignar membresía al customer');
  }

  return response.data ?? response;
}
