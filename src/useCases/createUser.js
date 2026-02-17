import { UserService } from '../services/UserService.js';
import { toCreatePayload } from '../models/User.js';

/**
 * Caso de uso: crear un usuario.
 * Valida campos requeridos, construye el payload con el modelo y llama al servicio.
 * @param {object} form - Campos del formulario (nombre o first_name/last_name, email, phone/telefono, birth_date?, password, role?, status?)
 * @returns {Promise<object>} Usuario creado normalizado
 */
export async function createUser(form) {
  const payload = toCreatePayload(form);
  if (!payload.email?.trim()) throw new Error('El email es obligatorio');
  if (!payload.password) throw new Error('La contraseña es obligatoria');
  return UserService.create(payload);
}
