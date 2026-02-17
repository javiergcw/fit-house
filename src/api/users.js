import { http } from './httpClient.js';

/**
 * GET /users?page=1&limit=20
 * @param {{ page?: number, limit?: number }} [params] - page (default 1), limit (default 20)
 * @returns {Promise<{ data: Array<object>, pagination: { page: number, limit: number, total: number, total_pages: number } }>}
 */
export async function getUsers(params = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const searchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  const response = await http.get(`/users?${searchParams}`);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al obtener usuarios');
  }

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? { page, limit, total: 0, total_pages: 0 },
  };
}

/**
 * GET /users/:id
 * @param {string} id - ID del usuario
 * @param {{ signal?: AbortSignal }} [options] - signal para cancelar la petición
 * @returns {Promise<object>} Usuario (objeto plano del backend)
 */
export async function getUserById(id, options = {}) {
  if (!id) throw new Error('ID de usuario requerido');
  const { signal, ...rest } = options;
  const response = await http.get(`/users/${encodeURIComponent(id)}`, { signal, ...rest });

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Usuario no encontrado');
  }

  return response.data;
}

/**
 * POST /users
 * @param {object} payload - first_name, last_name, email, phone?, birth_date?, password, role?, status?
 * @returns {Promise<object>} Usuario creado (objeto plano del backend)
 */
export async function createUser(payload) {
  const response = await http.post('/users', payload);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al crear usuario');
  }

  return response.data;
}
