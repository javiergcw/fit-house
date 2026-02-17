import { MembershipService } from '../services/MembershipService.js';

/**
 * Caso de uso: obtener listado paginado de membresías.
 * @param {{ page?: number, limit?: number, status?: string }} [params] - status ej: 'active'
 * @returns {Promise<{ data: Array<object>, pagination: object }>}
 */
export async function getMembershipsList(params = {}) {
  return MembershipService.getMemberships(params);
}
