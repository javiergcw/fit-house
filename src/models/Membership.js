/**
 * Modelo de membresía. Normaliza el formato de la API al usado en la app.
 */

const MEMBERSHIP_TYPE_LABELS = {
  daily: 'Por días',
  weekly: 'Semanal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
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
    daily: 'dias',
    weekly: 'dias',
    monthly: 'mes',
    quarterly: 'mes',
    yearly: 'anio',
    custom: 'mes',
  };
  return map[membershipType] ?? 'mes';
}
