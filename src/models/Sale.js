/**
 * Modelo de venta. Normaliza el formato de la API.
 * API: id, customer_id, sale_date, total, status, ..., customer?: { full_name, email, ... }
 */

function normalizeCustomer(apiCustomer) {
  if (!apiCustomer) return null;
  return {
    ...apiCustomer,
    nombre: apiCustomer.full_name ?? apiCustomer.nombre ?? '',
  };
}

/**
 * Convierte una venta de la API al formato de la aplicación.
 * @param {object} apiSale - Venta tal como viene del backend (puede incluir customer anidado)
 * @returns {object|null}
 */
export function fromApi(apiSale) {
  if (!apiSale) return null;
  const saleDate = apiSale.sale_date ? new Date(apiSale.sale_date) : null;
  const customer = normalizeCustomer(apiSale.customer);
  const customerName = customer?.nombre ?? customer?.full_name ?? '';
  return {
    ...apiSale,
    saleDate,
    customer,
    customerName,
    totalFormatted: formatCurrency(apiSale.total, apiSale.currency),
  };
}

function formatCurrency(value, currency = 'COP') {
  if (value == null) return '—';
  const num = Number(value);
  if (Number.isNaN(num)) return '—';
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: currency || 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
