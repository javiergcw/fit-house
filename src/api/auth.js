import { http } from './httpClient.js';

/**
 * POST /auth/login
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object, company: object }>} data del login
 */
export async function login(credentials) {
  const { email, password } = credentials;
  const response = await http.post('/auth/login', { email, password });

  if (!response.success || !response.data) {
    throw new Error(response.message || 'Error en el login');
  }

  return response.data;
}
