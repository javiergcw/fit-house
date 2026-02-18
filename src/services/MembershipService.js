import { getMemberships as getMembershipsApi, createMembership as createMembershipApi, updateMembership as updateMembershipApi } from '../api/memberships.js';
import { fromApi as membershipFromApi, toApiCreatePayload } from '../models/Membership.js';
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
   * Crea una membresía (POST /memberships).
   * @param {{ tipo?: string, duracionDias?: number, precio?: number, status?: string }} form - formulario UI; o payload API directo
   * @returns {Promise<object|null>} Membresía creada normalizada
   */
  async create(form) {
    const payload = form.membership_type != null
      ? form
      : toApiCreatePayload(form);
    const apiMembership = await createMembershipApi(payload);
    return membershipFromApi(apiMembership);
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
