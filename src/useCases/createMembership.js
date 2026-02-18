import { MembershipService } from '../services/MembershipService.js';

/**
 * Caso de uso: crear una membresía (POST /memberships).
 * @param {{ tipo?: string, duracionDias?: number|string, precio?: number|string, status?: string }} form
 *   - tipo: 'dias' | 'mes' | 'anio' (se mapea a membership_type: day | month | year)
 *   - duration_days, price, currency COP y status active se envían al backend
 * @returns {Promise<object>} Membresía creada normalizada
 */
export async function createMembership(form) {
  return MembershipService.create(form);
}
