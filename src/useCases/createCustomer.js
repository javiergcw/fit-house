import { CustomerService } from '../services/CustomerService.js';
import { toCreatePayload } from '../models/Customer.js';

/**
 * Caso de uso: crear un customer.
 * @param {object} form - Campos del formulario (full_name, email, doc_type, doc_number, etc.)
 * @returns {Promise<object>} Customer creado normalizado
 */
export async function createCustomer(form) {
  const email = (form.email ?? '').trim();
  if (!email) throw new Error('El email es obligatorio');
  const payload = toCreatePayload(form);
  if (!payload.full_name) throw new Error('El nombre es obligatorio');
  return CustomerService.create(payload);
}
