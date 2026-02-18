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
 * GET /customer-memberships/expiring
 * Suscripciones por vencer o vencidas (sin paginación).
 * @returns {Promise<{ success: boolean, message: string, data: Array<{ subscription, customer, membership, days_until_expiry }> }>}
 */
export async function getExpiringCustomerMemberships(options = {}) {
  const { signal, ...rest } = options;
  const response = await http.get('/customer-memberships/expiring', { signal, ...rest });

  if (response.success === false) {
    throw new Error(response.message || 'Error al obtener suscripciones por vencer');
  }

  return response;
}

/**
 * GET /customer-memberships?status=expired&customer_status=all|active|inactive&page=1&limit=20
 * Lista membresías expiradas, opcionalmente filtradas por estado del customer (personas idas = inactive).
 * @param {{ page?: number, limit?: number, customer_status?: 'all'|'active'|'inactive' }} [params]
 * @returns {Promise<{ data: Array<object>, pagination: object }>}
 */
export async function getExpiredCustomerMemberships(params = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const customerStatus = params.customer_status ?? 'all';
  const searchParams = new URLSearchParams({
    status: 'expired',
    page: String(page),
    limit: String(limit),
  });
  if (customerStatus !== 'all') {
    searchParams.set('customer_status', customerStatus);
  }
  const response = await http.get(`/customer-memberships?${searchParams}`);

  if (!response.success) {
    throw new Error(response.message || 'Error al obtener membresías expiradas');
  }

  const body = response.data ?? {};
  return {
    data: body.data ?? [],
    pagination: body.pagination ?? { page, limit, total: 0, total_pages: 0 },
  };
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
