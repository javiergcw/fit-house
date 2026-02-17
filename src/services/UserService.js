import { getUsers as getUsersApi, getUserById as getUserByIdApi, createUser as createUserApi, updateUser as updateUserApi } from '../api/users.js';
import { fromApi as userFromApi } from '../models/User.js';
import { fromApi as paginationFromApi } from '../models/Pagination.js';

/**
 * Servicio de usuarios. Encapsula la API de users y normaliza con los modelos.
 */
export const UserService = {
  /**
   * Obtiene el listado paginado de usuarios.
   * @param {{ page?: number, limit?: number }} [params]
   * @returns {Promise<{ data: Array<object>, pagination: object }>}
   */
  async getUsers(params = {}) {
    const result = await getUsersApi(params);
    return {
      data: (result.data ?? []).map(userFromApi).filter(Boolean),
      pagination: paginationFromApi(result.pagination),
    };
  },

  /**
   * Obtiene un usuario por ID.
   * @param {string} id
   * @param {{ signal?: AbortSignal }} [options]
   * @returns {Promise<object|null>} Usuario normalizado o null
   */
  async getUserById(id, options = {}) {
    const apiUser = await getUserByIdApi(id, options);
    return userFromApi(apiUser);
  },

  /**
   * Crea un usuario (POST /users).
   * @param {object} payload - first_name, last_name, email, phone?, birth_date?, password, role?, status?
   * @returns {Promise<object|null>} Usuario creado normalizado
   */
  async create(payload) {
    const apiUser = await createUserApi(payload);
    return userFromApi(apiUser);
  },

  /**
   * Actualiza el estado de un usuario (PUT /users/:id).
   * @param {string} id - ID del usuario
   * @param {'active' | 'inactive'} status
   * @returns {Promise<object|null>} Usuario actualizado normalizado
   */
  async updateStatus(id, status) {
    const apiUser = await updateUserApi(id, { status });
    return userFromApi(apiUser);
  },
};
