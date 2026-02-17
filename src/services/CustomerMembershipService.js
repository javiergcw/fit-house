import { getCustomerMemberships as getCustomerMembershipsApi } from '../api/customerMemberships.js';
import { fromApi as customerMembershipFromApi } from '../models/CustomerMembership.js';

/**
 * Servicio de membresías por customer. GET /customers/:id/memberships.
 */
export const CustomerMembershipService = {
  /**
   * Obtiene la membresía actual y el historial de membresías del customer.
   * @param {string} customerId
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ current_membership: object|null, memberships: object[] }>}
   */
  async getCustomerMemberships(customerId, options = {}) {
    const data = await getCustomerMembershipsApi(customerId, options);
    return customerMembershipFromApi(data);
  },
};
