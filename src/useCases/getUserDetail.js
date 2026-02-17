import { UserService } from '../services/UserService.js';

/**
 * Caso de uso: obtener el detalle de un usuario por ID.
 * Usa UserService y devuelve el usuario normalizado para la UI.
 * @param {string} id - ID del usuario
 * @param {{ signal?: AbortSignal }} [options] - signal para cancelar la petición
 * @returns {Promise<object|null>}
 * @throws {Error} Si el usuario no existe o falla la petición
 */
export async function getUserDetail(id, options = {}) {
  if (!id?.trim()) throw new Error('ID de usuario requerido');
  return UserService.getUserById(id.trim(), options);
}
