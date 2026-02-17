import { getInforme as getInformeApi } from '../api/reports.js';
import { fromApi as reportFromApi } from '../models/Report.js';

/**
 * Servicio de informes. GET /reports/informe
 */
export const ReportService = {
  /**
   * Obtiene el informe para un rango de fechas.
   * @param {string} dateFrom - YYYY-MM-DD
   * @param {string} dateTo - YYYY-MM-DD
   * @returns {Promise<object>} Informe normalizado
   */
  async getInforme(dateFrom, dateTo) {
    const data = await getInformeApi({ date_from: dateFrom, date_to: dateTo });
    return reportFromApi(data);
  },
};
