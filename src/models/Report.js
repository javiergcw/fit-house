/**
 * Modelo para GET /reports/informe. Normaliza la respuesta para la UI de Informes.
 */

const MEMBERSHIP_TYPE_LABELS = {
  daily: 'Por días',
  weekly: 'Semanal',
  monthly: 'Mensual',
  quarterly: 'Trimestral',
  yearly: 'Anual',
  custom: 'Personalizado',
};

function formatMembershipType(type) {
  const t = (type || '').toLowerCase();
  return MEMBERSHIP_TYPE_LABELS[t] || type || '—';
}

function formatDayLabel(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr + 'T12:00:00');
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short' });
}

/**
 * Normaliza la respuesta del informe.
 * @param {object} apiData
 * @returns {object} { salesQuantity, totalRevenue, uniqueCustomersCount, salesByProduct, salesByDay, topCustomers, topMembershipsSold, pieProducts }
 */
export function fromApi(apiData) {
  if (!apiData) {
    return {
      salesQuantity: 0,
      totalRevenue: 0,
      uniqueCustomersCount: 0,
      salesByProduct: [],
      salesByDay: [],
      topCustomers: [],
      topMembershipsSold: [],
      pieProducts: [],
    };
  }

  const salesByProduct = (apiData.sales_by_product ?? []).map((p) => ({
    product: p.product,
    nombre: formatMembershipType(p.product),
    quantity_sold: Number(p.quantity_sold) ?? 0,
    count: Number(p.quantity_sold) ?? 0,
    total_revenue: Number(p.total_revenue) ?? 0,
    ingresos: Number(p.total_revenue) ?? 0,
    membershipId: p.product,
  }));

  const salesByDay = (apiData.sales_and_revenue_by_day ?? []).map((d) => ({
    date: d.date,
    fecha: d.date,
    label: formatDayLabel(d.date),
    sales_count: Number(d.sales_count) ?? 0,
    ventas: Number(d.sales_count) ?? 0,
    revenue: Number(d.revenue) ?? 0,
    ingresos: Number(d.revenue) ?? 0,
  }));

  const topCustomers = (apiData.top_10_customers_by_payment ?? []).map((c) => ({
    customer_id: c.customer_id,
    userId: c.customer_id,
    full_name: c.full_name,
    nombre: c.full_name ?? '—',
    total_paid: Number(c.total_paid) ?? 0,
    total: Number(c.total_paid) ?? 0,
    count: 1,
  }));

  const topMembershipsSold = apiData.top_memberships_sold ?? [];
  const pieProducts = topMembershipsSold.map((m, i) => {
    const COLORS = ['#00A3FF', '#81c784', '#ffb74d', '#ba68c8', '#4dd0e1', '#ff8a65', '#9575cd', '#4db6ac', '#7986cb', '#a1887f'];
    return {
      name: formatMembershipType(m.membership_type),
      value: Number(m.quantity) ?? 0,
      color: COLORS[i % COLORS.length],
    };
  }).filter((p) => p.value > 0);

  return {
    salesQuantity: Number(apiData.sales_quantity) ?? 0,
    totalRevenue: Number(apiData.total_revenue) ?? 0,
    uniqueCustomersCount: Number(apiData.unique_customers_count) ?? 0,
    salesByProduct,
    salesByDay,
    topCustomers,
    topMembershipsSold,
    pieProducts,
  };
}
