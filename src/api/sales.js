import { http } from './httpClient.js';

/**
 * GET /sales?page=1&limit=20&user_name=...&membership_id=...&date_from=...&date_to=...
 * @param {{ page?: number, limit?: number, user_name?: string, membership_id?: string, date_from?: string, date_to?: string }} [params] - date_from/date_to en YYYY-MM-DD
 * @returns {Promise<{ data: Array<object>, pagination: { page: number, limit: number, total: number, total_pages: number } }>}
 */
export async function getSales(params = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 20;
  const searchParams = new URLSearchParams({ page: String(page), limit: String(limit) });
  const userName = (params.user_name ?? '').trim();
  if (userName) searchParams.set('user_name', userName);
  const membershipId = (params.membership_id ?? '').trim();
  if (membershipId) searchParams.set('membership_id', membershipId);
  const dateFrom = (params.date_from ?? '').trim();
  if (dateFrom) searchParams.set('date_from', dateFrom);
  const dateTo = (params.date_to ?? '').trim();
  if (dateTo) searchParams.set('date_to', dateTo);
  const response = await http.get(`/sales?${searchParams}`);

  if (!response.success || response.data == null) {
    throw new Error(response.message || 'Error al obtener ventas');
  }

  return {
    data: response.data.data ?? [],
    pagination: response.data.pagination ?? { page, limit, total: 0, total_pages: 0 },
  };
}
