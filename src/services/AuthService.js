import { login as authLogin } from '../api/auth.js';

/**
 * Servicio de autenticación. Encapsula la API de auth.
 */
export const AuthService = {
  /**
   * Inicia sesión con email y contraseña.
   * @param {{ email: string, password: string }} credentials
   * @returns {Promise<{ token: string, user: object, company: object }>}
   */
  async login(credentials) {
    return authLogin(credentials);
  },
};
