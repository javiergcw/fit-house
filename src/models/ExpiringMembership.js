import { fromApi as membershipFromApi } from './Membership.js';

/**
 * Normaliza un ítem de la respuesta GET /customer-memberships/expiring.
 * @param {object} apiItem - { subscription, customer, membership, days_until_expiry }
 * @returns {object|null}
 */
export function fromApiItem(apiItem) {
  if (!apiItem) return null;
  const subscription = apiItem.subscription ?? {};
  const customer = apiItem.customer ?? {};
  const membershipRaw = apiItem.membership;
  const membership = membershipRaw ? membershipFromApi(membershipRaw) : null;

  const startDate = subscription.start_date ? new Date(subscription.start_date) : null;
  const endDate = subscription.end_date ? new Date(subscription.end_date) : null;

  return {
    id: subscription.id,
    customer_id: subscription.customer_id ?? customer.id,
    customer,
    customer_name: customer.full_name ?? customer.nombre ?? customer.email ?? '—',
    membership_id: subscription.membership_id ?? membership?.id,
    membership,
    membership_name: membership?.nombre ?? (membershipRaw ? `${membershipRaw.membership_type ?? ''} (${membershipRaw.duration_days ?? 0} días)` : '—'),
    start_date: subscription.start_date,
    end_date: subscription.end_date,
    startDate,
    endDate,
    days_until_expiry: apiItem.days_until_expiry ?? null,
    status: subscription.status,
  };
}

/**
 * Normaliza la respuesta de GET /customer-memberships/expiring.
 * @param {object} apiData - { success, message, data: [...] }
 * @returns {{ message: string, data: object[] }}
 */
export function fromApi(apiData) {
  if (!apiData) return { message: '', data: [] };
  const list = (apiData.data ?? []).map(fromApiItem).filter(Boolean);
  return {
    message: apiData.message ?? '',
    data: list,
  };
}
