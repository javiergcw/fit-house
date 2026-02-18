import {
  getCustomerMemberships as getCustomerMembershipsApi,
  getExpiringCustomerMemberships as getExpiringCustomerMembershipsApi,
} from '../api/customerMemberships.js';
import { fromApi as customerMembershipFromApi } from '../models/CustomerMembership.js';
import { fromApi as expiringMembershipFromApi } from '../models/ExpiringMembership.js';

/**
 * Servicio de membresías por customer. GET /customers/:id/memberships y GET /customer-memberships/expiring.
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

  /**
   * Obtiene suscripciones por vencer o vencidas (GET /customer-memberships/expiring).
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<{ message: string, data: object[] }>}
   */
  async getExpiring(options = {}) {
    const response = await getExpiringCustomerMembershipsApi(options);
    return expiringMembershipFromApi(response);
  },
};
