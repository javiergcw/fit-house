import { createCustomerMembership as createCustomerMembershipApi } from '../api/customerMemberships.js';

/**
 * Caso de uso: asignar una membresía a un customer (POST /customer-memberships).
 * @param {string} customerId - ID del customer
 * @param {string} membershipId - ID de la membresía
 * @returns {Promise<object>} Respuesta del backend
 */
export async function createCustomerMembership(customerId, membershipId) {
  if (!customerId?.trim()) throw new Error('ID de customer requerido');
  if (!membershipId?.trim()) throw new Error('ID de membresía requerido');
  return createCustomerMembershipApi({
    customer_id: customerId.trim(),
    membership_id: membershipId.trim(),
  });
}
