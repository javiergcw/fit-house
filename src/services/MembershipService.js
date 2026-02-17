import { getMemberships as getMembershipsApi, updateMembership as updateMembershipApi } from '../api/memberships.js';
import { fromApi as membershipFromApi } from '../models/Membership.js';
import { fromApi as paginationFromApi } from '../models/Pagination.js';

/**
 * Servicio de membresías. Encapsula la API y normaliza con los modelos.
 */
export const MembershipService = {
  /**
   * Obtiene el listado paginado de membresías.
   * @param {{ page?: number, limit?: number, status?: string }} [params]
   * @returns {Promise<{ data: Array<object>, pagination: object }>}
   */
  async getMemberships(params = {}) {
    const result = await getMembershipsApi(params);
    return {
      data: (result.data ?? []).map(membershipFromApi).filter(Boolean),
      pagination: paginationFromApi(result.pagination),
    };
  },

  /**
   * Actualiza una membresía (PUT /memberships/:id). Ej: { status: 'active' | 'inactive' }
   * @param {string} id
   * @param {{ status?: 'active' | 'inactive' }} payload
   * @returns {Promise<object|null>} Membresía actualizada normalizada
   */
  async update(id, payload) {
    const apiMembership = await updateMembershipApi(id, payload);
    return membershipFromApi(apiMembership);
  },
};
