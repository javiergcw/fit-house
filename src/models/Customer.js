/**
 * Modelo de customer. Normaliza el formato de la API al usado en la app.
 * API: id, company_id, doc_type, doc_number, full_name, email, phone, birth_date, address, status, created_at, updated_at
 */

/**
 * Convierte un customer de la API al formato de la aplicación.
 * @param {object} apiCustomer - Customer tal como viene del backend
 * @returns {object|null} Customer normalizado o null
 */
export function fromApi(apiCustomer) {
  if (!apiCustomer) return null;
  const doc = [apiCustomer.doc_type, apiCustomer.doc_number].filter(Boolean).join(' ').trim() || null;
  return {
    ...apiCustomer,
    nombre: apiCustomer.full_name ?? apiCustomer.nombre ?? '',
    telefono: apiCustomer.phone ?? apiCustomer.telefono ?? null,
    direccion: apiCustomer.address ?? apiCustomer.direccion ?? null,
    documento: doc ?? apiCustomer.documento ?? null,
  };
}

const DOC_TYPES = ['CC', 'TI', 'PASAPORTE'];

/**
 * Construye el payload para POST /customers a partir del formulario.
 * @param {object} form - { doc_type?, doc_number?, full_name?, email?, phone?, birth_date?, address?, status? }
 * @returns {object} Payload para la API
 */
export function toCreatePayload(form) {
  const doc_type = (form.doc_type || 'CC').trim().toUpperCase();
  return {
    doc_type: DOC_TYPES.includes(doc_type) ? doc_type : 'CC',
    doc_number: (form.doc_number ?? '').trim() || undefined,
    full_name: (form.full_name ?? form.nombre ?? '').trim() || undefined,
    email: (form.email ?? '').trim() || undefined,
    phone: (form.phone ?? form.telefono ?? '').trim() || undefined,
    birth_date: (form.birth_date ?? '').trim() || undefined,
    address: (form.address ?? form.direccion ?? '').trim() || undefined,
    status: (form.status ?? 'active').trim() || 'active',
  };
}
