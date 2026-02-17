import { http } from './httpClient.js';

/**
 * GET /dashboard
 * @returns {Promise<object>} data: { stats, sales_by_month, memberships, last_sales }
 */
export async function getDashboard() {
  const response = await http.get('/dashboard');

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al obtener el dashboard');
  }

  return response.data;
}
