import { fromApi as membershipFromApi } from './Membership.js';

/**
 * Normaliza un item de customer-membership (con membership anidada).
 * @param {object} apiItem - { id, start_date, end_date, status, membership: {...}, ... }
 * @returns {object|null}
 */
function fromApiItem(apiItem) {
  if (!apiItem) return null;
  const membership = membershipFromApi(apiItem.membership) ?? apiItem.membership;
  const startDate = apiItem.start_date ? new Date(apiItem.start_date) : null;
  const endDate = apiItem.end_date ? new Date(apiItem.end_date) : null;
  const now = new Date();
  const isActive = endDate && now <= endDate && (apiItem.status === 'active');
  const daysLeft = endDate && isActive ? Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24))) : 0;
  return {
    ...apiItem,
    membership,
    start_date: apiItem.start_date,
    end_date: apiItem.end_date,
    startDate,
    endDate,
    isActive,
    daysLeft,
  };
}

/**
 * Normaliza la respuesta de GET /customers/:id/memberships.
 * Si hay varias membresías activas, los días restantes se acumulan y "válida hasta" usa la fecha más lejana.
 * @param {object} apiData - { current_membership?, memberships? }
 * @returns {{ current_membership: object|null, memberships: object[] }}
 */
export function fromApi(apiData) {
  if (!apiData) return { current_membership: null, memberships: [] };

  const currentRaw = fromApiItem(apiData.current_membership);
  const membershipsNormalized = (apiData.memberships ?? []).map(fromApiItem).filter(Boolean);

  const allItems = [];
  if (currentRaw) allItems.push(currentRaw);
  membershipsNormalized.forEach((m) => {
    if (!allItems.some((x) => x.id === m.id)) allItems.push(m);
  });

  const activeItems = allItems.filter((m) => m.isActive);
  const totalDaysLeft = activeItems.reduce((acc, m) => acc + (m.daysLeft || 0), 0);
  const latestEndDate =
    activeItems.length > 0
      ? new Date(
          Math.max(
            ...activeItems.map((m) => {
              const d = m.endDate instanceof Date ? m.endDate : m.end_date ? new Date(m.end_date) : null;
              return d ? d.getTime() : 0;
            })
          )
        )
      : null;

  const baseCurrent = currentRaw || activeItems[0] || null;
  const current_membership = baseCurrent
    ? {
        ...baseCurrent,
        daysLeft: totalDaysLeft,
        endDate: latestEndDate ?? baseCurrent.endDate,
        end_date: latestEndDate ? latestEndDate.toISOString().slice(0, 10) : baseCurrent.end_date,
      }
    : null;

  return {
    current_membership,
    memberships: membershipsNormalized,
  };
}
