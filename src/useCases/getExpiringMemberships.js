import { CustomerMembershipService } from '../services/CustomerMembershipService.js';

/**
 * Caso de uso: obtener suscripciones por vencer o vencidas (GET /customer-memberships/expiring).
 * @param {{ signal?: AbortSignal }} [options]
 * @returns {Promise<{ message: string, data: object[] }>}
 */
export async function getExpiringMemberships(options = {}) {
  return CustomerMembershipService.getExpiring(options);
}
