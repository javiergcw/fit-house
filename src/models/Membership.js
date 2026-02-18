/**
 * Modelo de membresía. Normaliza el formato de la API al usado en la app.
 */

const MEMBERSHIP_TYPE_LABELS = {
  day: 'Por días',
  daily: 'Por días',
  weekly: 'Semanal',
  month: 'Mensual',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  year: 'Anual',
  yearly: 'Anual',
  custom: 'Personalizado',
};

/**
 * Convierte una membresía de la API al formato de la aplicación.
 * @param {object} apiMembership - { id, company_id, membership_type, duration_days, price, currency, status, ... }
 * @returns {object|null} Membresía normalizada (con nombre, tipo, duracionDias, precio)
 */
export function fromApi(apiMembership) {
  if (!apiMembership) return null;
  const tipo = mapMembershipTypeToTipo(apiMembership.membership_type);
  const duracionDias = Number(apiMembership.duration_days) || 0;
  const label = MEMBERSHIP_TYPE_LABELS[apiMembership.membership_type] || apiMembership.membership_type || 'Plan';
  const nombre = apiMembership.nombre ?? `${label} (${duracionDias} días)`;
  return {
    ...apiMembership,
    nombre,
    tipo,
    duracionDias,
    precio: apiMembership.precio ?? apiMembership.price,
  };
}

function mapMembershipTypeToTipo(membershipType) {
  const map = {
    day: 'dias',
    daily: 'dias',
    weekly: 'dias',
    month: 'mes',
    monthly: 'mes',
    quarterly: 'mes',
    year: 'anio',
    yearly: 'anio',
    custom: 'mes',
  };
  return map[membershipType] ?? 'mes';
}

/**
 * Mapea el tipo del formulario (dias/mes/anio) al membership_type de la API.
 */
function mapTipoToMembershipType(tipo) {
  const map = {
    dias: 'day',
    mes: 'month',
    anio: 'year',
  };
  return map[tipo] ?? 'month';
}

/**
 * Construye el body para POST /memberships a partir del formulario de la UI.
 * @param {{ tipo: string, duracionDias: number|string, precio: number|string, status?: string }} form - tipo: 'dias'|'mes'|'anio'
 * @returns {{ membership_type: string, duration_days: number, price: number, currency: string, status: string }}
 */
export function toApiCreatePayload(form) {
  const duration_days = Number(form.duracionDias) || 1;
  const price = Number(form.precio) || 0;
  return {
    membership_type: mapTipoToMembershipType(form.tipo ?? 'mes'),
    duration_days,
    price,
    currency: 'COP',
    status: form.status ?? 'active',
  };
}
