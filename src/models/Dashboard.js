/**
 * Modelo para la respuesta de GET /dashboard.
 * Normaliza stats, sales_by_month, memberships, last_sales para la UI.
 */

const MONTH_LABELS = {
  '01': 'ene', '02': 'feb', '03': 'mar', '04': 'abr', '05': 'may', '06': 'jun',
  '07': 'jul', '08': 'ago', '09': 'sep', '10': 'oct', '11': 'nov', '12': 'dic',
};

function formatMonthKey(monthStr) {
  if (!monthStr || monthStr.length < 7) return monthStr;
  const [year, month] = monthStr.split('-');
  const short = MONTH_LABELS[month] || month;
  const yearShort = year ? year.slice(-2) : '';
  return `${short} '${yearShort}`;
}

/**
 * Convierte sales_by_month de la API a formato del gráfico (mes, ventas).
 */
function mapSalesByMonth(apiList) {
  if (!Array.isArray(apiList)) return [];
  return apiList.map((item) => ({
    mes: formatMonthKey(item.month),
    ventas: Number(item.quantity) || 0,
  }));
}

/**
 * Convierte memberships (active, inactive) a formato del pie (Activas, Vencidas).
 */
function mapMembershipsChart(memberships) {
  if (!memberships) return [];
  const active = Number(memberships.active) || 0;
  const inactive = Number(memberships.inactive) || 0;
  return [
    { name: 'Activas', value: active, color: '#81c784' },
    { name: 'Vencidas', value: inactive, color: '#e57373' },
  ].filter((d) => d.value > 0);
}

/**
 * Convierte last_sales a filas de tabla (una fila por item dentro de cada venta).
 */
function mapLastSalesRows(apiList) {
  if (!Array.isArray(apiList)) return [];
  const rows = [];
  apiList.forEach((sale, idx) => {
    const items = sale.items || [];
    if (items.length === 0) {
      rows.push({
        id: `sale-${idx}`,
        fecha: sale.sale_date,
        usuario: sale.user_name ?? '—',
        membresia: '—',
        vigencia: null,
      });
    } else {
      items.forEach((item, i) => {
        rows.push({
          id: `sale-${idx}-${i}`,
          fecha: sale.sale_date,
          usuario: sale.user_name ?? '—',
          membresia: formatMembershipType(item.membership),
          vigencia: item.vigencia || null,
        });
      });
    }
  });
  return rows;
}

function formatMembershipType(type) {
  const t = (type || '').toLowerCase();
  const map = { daily: 'Por días', weekly: 'Semanal', monthly: 'Mensual', quarterly: 'Trimestral', yearly: 'Anual', custom: 'Personalizado' };
  return map[t] || type || '—';
}

/**
 * Normaliza la respuesta completa del dashboard.
 * @param {object} apiData - data del backend
 * @returns {{ stats: object, salesByMonth: array, activeVsExpired: array, lastSalesRows: array }}
 */
export function fromApi(apiData) {
  if (!apiData) {
    return {
      stats: { users: 0, active_members: 0, total_sales: 0, sales_this_month: 0 },
      salesByMonth: [],
      activeVsExpired: [],
      lastSalesRows: [],
    };
  }
  const stats = apiData.stats ?? {};
  const totalMemberships = (Number((apiData.memberships || {}).active) || 0) + (Number((apiData.memberships || {}).inactive) || 0);
  return {
    stats: {
      users: Number(stats.users) || 0,
      active_members: Number(stats.active_members) || 0,
      total_sales: Number(stats.total_sales) || 0,
      sales_this_month: Number(stats.sales_this_month) || 0,
      memberships_total: totalMemberships,
    },
    salesByMonth: mapSalesByMonth(apiData.sales_by_month),
    activeVsExpired: mapMembershipsChart(apiData.memberships),
    lastSalesRows: mapLastSalesRows(apiData.last_sales),
  };
}
