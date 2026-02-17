/**
 * Modelo de paginación para listados de la API.
 * @typedef {Object} Pagination
 * @property {number} page - Página actual
 * @property {number} limit - Elementos por página
 * @property {number} total - Total de elementos
 * @property {number} total_pages - Total de páginas
 */

/**
 * Normaliza el objeto de paginación de la API.
 * @param {object} apiPagination
 * @returns {{ page: number, limit: number, total: number, total_pages: number }}
 */
export function fromApi(apiPagination) {
  if (!apiPagination) return { page: 1, limit: 20, total: 0, total_pages: 0 };
  return {
    page: Number(apiPagination.page) || 1,
    limit: Number(apiPagination.limit) || 20,
    total: Number(apiPagination.total) || 0,
    total_pages: Number(apiPagination.total_pages) || 0,
  };
}
