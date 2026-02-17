import { CustomerMembershipService } from '../services/CustomerMembershipService.js';

/**
 * Caso de uso: obtener membresía actual e historial de membresías de un customer.
 * @param {string} customerId - ID del customer
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ current_membership: object|null, memberships: object[] }>}
 */
export async function getCustomerMemberships(customerId, options = {}) {
  if (!customerId?.trim()) throw new Error('ID de customer requerido');
  return CustomerMembershipService.getCustomerMemberships(customerId.trim(), options);
}
