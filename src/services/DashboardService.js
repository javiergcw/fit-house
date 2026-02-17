import { getDashboard as getDashboardApi } from '../api/dashboard.js';
import { fromApi as dashboardFromApi } from '../models/Dashboard.js';

/**
 * Servicio del dashboard. GET /dashboard
 */
export const DashboardService = {
  /**
   * Obtiene los datos del dashboard.
   * @returns {Promise<{ stats, salesByMonth, activeVsExpired, lastSalesRows }>}
   */
  async getDashboard() {
    const data = await getDashboardApi();
    return dashboardFromApi(data);
  },
};
