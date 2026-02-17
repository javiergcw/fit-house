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
 * @param {object} apiData - { current_membership?, memberships? }
 * @returns {{ current_membership: object|null, memberships: object[] }}
 */
export function fromApi(apiData) {
  if (!apiData) return { current_membership: null, memberships: [] };
  return {
    current_membership: fromApiItem(apiData.current_membership) ?? null,
    memberships: (apiData.memberships ?? []).map(fromApiItem).filter(Boolean),
  };
}
