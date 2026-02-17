import { http } from './httpClient.js';

/**
 * GET /memberships?page=1&limit=10
 * Opcional: status=active|inactive para filtrar por estado.
 * @param {{ page?: number, limit?: number, status?: string }} [params] - status: 'active' | 'inactive' (si no se envía, lista todas)
 * @returns {Promise<{ data: Array<object>, pagination: object }>}
 */
export async function getMemberships(params = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 10;
  const searchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  if (params.status != null && params.status !== '') {
    searchParams.set('status', String(params.status));
  }
  const response = await http.get(`/memberships?${searchParams}`);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al obtener membresías');
  }

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? { page, limit, total: 0, total_pages: 0 },
  };
}

/**
 * PUT /memberships/:id
 * @param {string} id - ID de la membresía
 * @param {{ status: 'active' | 'inactive' }} body
 * @returns {Promise<object>} Membresía actualizada (objeto plano del backend)
 */
export async function updateMembership(id, body) {
  if (!id) throw new Error('ID de membresía requerido');
  const response = await http.put(`/memberships/${encodeURIComponent(id)}`, body);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al actualizar membresía');
  }

  return response.data;
}
