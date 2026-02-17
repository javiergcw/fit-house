import { UserService } from '../services/UserService.js';

/**
 * Caso de uso: actualizar el estado de un usuario (activo/inactivo).
 * @param {string} id - ID del usuario
 * @param {'active' | 'inactive'} status - Nuevo estado
 * @returns {Promise<object>} Usuario actualizado normalizado
 */
export async function updateUserStatus(id, status) {
  if (!id?.trim()) throw new Error('ID de usuario requerido');
  const s = (status || '').trim().toLowerCase();
  if (s !== 'active' && s !== 'inactive') throw new Error('Estado debe ser "active" o "inactive"');
  return UserService.updateStatus(id.trim(), s);
}
