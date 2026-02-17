import { DashboardService } from '../services/DashboardService.js';

/**
 * Caso de uso: obtener datos del dashboard.
 * @returns {Promise<{ stats, salesByMonth, activeVsExpired, lastSalesRows }>}
 */
export async function getDashboard() {
  return DashboardService.getDashboard();
}
