import { MembershipService } from '../services/MembershipService.js';

/**
 * Caso de uso: actualizar una membresía (por ahora solo estado).
 * @param {string} id - ID de la membresía
 * @param {{ status: 'active' | 'inactive' }} payload
 * @returns {Promise<object>} Membresía actualizada normalizada
 */
export async function updateMembership(id, payload) {
  if (!id?.trim()) throw new Error('ID de membresía requerido');
  const status = payload?.status;
  if (status !== 'active' && status !== 'inactive') {
    throw new Error('El estado debe ser "active" o "inactive"');
  }
  return MembershipService.update(id, { status });
}
