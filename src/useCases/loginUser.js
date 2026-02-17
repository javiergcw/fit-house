import { AuthService } from '../services/AuthService.js';

/**
 * Caso de uso: iniciar sesión con email y contraseña.
 * Usa AuthService y devuelve los datos de la sesión (token, user, company).
 * @param {{ email: string, password: string }} credentials
 * @returns {Promise<{ token: string, user: object, company: object }>}
 * @throws {Error} Si las credenciales son inválidas o falla la petición
 */
export async function loginUser(credentials) {
  const { email, password } = credentials ?? {};
  if (!email?.trim() || !password) {
    throw new Error('Ingresa email y contraseña');
  }
  return AuthService.login({ email: email.trim(), password });
}
