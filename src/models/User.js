/**
 * Modelo de usuario. Normaliza el formato de la API al usado en la app.
 */

/**
 * Convierte un usuario de la API al formato de la aplicación.
 * Añade `name` (first_name + last_name) y mantiene compatibilidad con nombres legacy (nombre, telefono).
 * @param {object} apiUser - Usuario tal como viene del backend
 * @returns {object|null} Usuario normalizado o null
 */
export function fromApi(apiUser) {
  if (!apiUser) return null;
  const name = [apiUser.first_name, apiUser.last_name].filter(Boolean).join(' ').trim() || apiUser.email || '';
  return {
    ...apiUser,
    name,
    nombre: apiUser.nombre ?? name,
    telefono: apiUser.telefono ?? apiUser.phone,
  };
}

/**
 * Construye el payload para POST /users a partir del formulario.
 * Acepta first_name/last_name o nombre (se divide por el primer espacio).
 * @param {object} form - { first_name?, last_name?, nombre?, email, phone?, telefono?, birth_date?, password, role?, status? }
 * @returns {object} Payload para la API
 */
export function toCreatePayload(form) {
  let first_name = form.first_name ?? '';
  let last_name = form.last_name ?? '';
  if ((!first_name && !last_name) && form.nombre) {
    const parts = String(form.nombre).trim().split(/\s+/);
    first_name = parts[0] ?? '';
    last_name = parts.slice(1).join(' ') ?? '';
  }
  return {
    first_name: first_name.trim() || undefined,
    last_name: last_name.trim() || undefined,
    email: form.email?.trim() || undefined,
    phone: (form.phone ?? form.telefono)?.trim() || undefined,
    birth_date: form.birth_date?.trim() || undefined,
    password: form.password || undefined,
    role: form.role?.trim() || 'member',
    status: form.status?.trim() || 'active',
  };
}
