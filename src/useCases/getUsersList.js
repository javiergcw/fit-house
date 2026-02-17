import { UserService } from '../services/UserService.js';

/**
 * Caso de uso: obtener listado paginado de usuarios.
 * Usa UserService (API + modelos) y devuelve datos listos para la UI.
 * @param {{ page?: number, limit?: number }} [params]
 * @returns {Promise<{ data: Array<object>, pagination: object }>}
 */
export async function getUsersList(params = {}) {
  return UserService.getUsers(params);
}
