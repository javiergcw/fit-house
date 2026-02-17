import { http } from './httpClient.js';

/**
 * GET /customers?page=1&limit=10
 * @param {{ page?: number, limit?: number }} [params] - page (default 1), limit (default 10)
 * @returns {Promise<{ data: Array<object>, pagination: { page: number, limit: number, total: number, total_pages: number } }>}
 */
export async function getCustomers(params = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const searchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await http.get(`/customers?${searchParams}`);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al obtener customers');
  }

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? { page, limit, total: 0, total_pages: 0 },
  };
}

/**
 * GET /customers/:id
 * @param {string} id - ID del customer
 * @param {{ signal?: AbortSignal }} [options] - signal para cancelar la petición
 * @returns {Promise<object>} Customer (objeto plano del backend)
 */
export async function getCustomerById(id, options = {}) {
  if (!id) throw new Error('ID de customer requerido');
  const { signal, ...rest } = options;
  const response = await http.get(`/customers/${encodeURIComponent(id)}`, { signal, ...rest });

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Customer no encontrado');
  }

  return response.data;
}

/**
 * POST /customers
 * @param {object} payload - doc_type, doc_number, full_name, email, phone?, birth_date?, address?, status?
 * @returns {Promise<object>} Customer creado (objeto plano del backend)
 */
export async function createCustomer(payload) {
  const response = await http.post('/customers', payload);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al crear customer');
  }

  return response.data;
}
